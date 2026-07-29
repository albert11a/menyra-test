// Mnyra Analytics Dashboard-Rendering (Business-Tab + Heart).
// Reines String-Rendering + eigenes scoped CSS (Light/Dark via Modifier-Klasse),
// damit dieselben Komponenten in Mnyra Menu (hell) und Heart (dunkel) laufen.

import {
  ANALYTICS_RANGE_PRESETS,
  formatCompactNumber,
  formatDeltaLabel
} from "./analytics-dashboard-core.js";

const STYLE_ELEMENT_ID = "mnyraAnalyticsStyles";

// Chart-Farben sind gegen die jeweilige Flaeche validiert
// (hell: #ffffff, dunkel: #16161a; siehe docs/mnyra-analytics-system.md).
export const ANALYTICS_DASHBOARD_CSS = `
.mnyra-an {
  --an-surface: #ffffff;
  --an-plane: #f8fafc;
  --an-ink: #0f172a;
  --an-ink-2: #475569;
  --an-muted: #94a3b8;
  --an-grid: #e2e8f0;
  --an-border: rgba(15, 23, 42, 0.08);
  --an-series-1: #4f46e5;
  --an-series-2: #0d9488;
  --an-up: #047857;
  --an-down: #b91c1c;
  --an-chip-bg: #f1f5f9;
  --an-chip-active: #0f172a;
  --an-chip-active-ink: #ffffff;
  color: var(--an-ink);
  font-family: inherit;
}
.mnyra-an--dark {
  --an-surface: #16161a;
  --an-plane: #101014;
  --an-ink: #f4f4f5;
  --an-ink-2: #b8b8c0;
  --an-muted: #7d7d88;
  --an-grid: #2c2c31;
  --an-border: rgba(255, 255, 255, 0.10);
  --an-series-1: #6366f1;
  --an-series-2: #0f9d8c;
  --an-up: #34d399;
  --an-down: #f87171;
  --an-chip-bg: #232329;
  --an-chip-active: #f4f4f5;
  --an-chip-active-ink: #101014;
}
.mnyra-an * { box-sizing: border-box; }
.mnyra-an__filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 14px; }
.mnyra-an__chip {
  border: 1px solid var(--an-border);
  background: var(--an-chip-bg);
  color: var(--an-ink-2);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 9px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.mnyra-an__chip--active { background: var(--an-chip-active); color: var(--an-chip-active-ink); border-color: transparent; }
.mnyra-an__custom { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.mnyra-an__custom input {
  border: 1px solid var(--an-border);
  background: var(--an-surface);
  color: var(--an-ink);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
}
.mnyra-an__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (min-width: 720px) { .mnyra-an__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mnyra-an__card {
  background: var(--an-surface);
  border: 1px solid var(--an-border);
  border-radius: 20px;
  padding: 14px;
  min-width: 0;
}
.mnyra-an__section { margin-top: 14px; }
.mnyra-an__section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: var(--an-ink-2); margin: 0 0 10px; }
.mnyra-an__kpi-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--an-muted); margin: 0; }
.mnyra-an__kpi-value { font-size: 22px; font-weight: 700; margin: 4px 0 2px; color: var(--an-ink); }
.mnyra-an__kpi-delta { font-size: 11px; font-weight: 700; margin: 0; color: var(--an-ink-2); }
.mnyra-an__kpi-delta--up { color: var(--an-up); }
.mnyra-an__kpi-delta--down { color: var(--an-down); }
.mnyra-an__legend { display: flex; gap: 14px; align-items: center; margin: 0 0 8px; flex-wrap: wrap; }
.mnyra-an__legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--an-ink-2); }
.mnyra-an__legend-swatch { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
.mnyra-an__chart-wrap { position: relative; }
.mnyra-an__tooltip {
  position: absolute;
  pointer-events: none;
  background: var(--an-ink);
  color: var(--an-surface);
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 11px;
  line-height: 1.5;
  transform: translate(-50%, calc(-100% - 10px));
  white-space: nowrap;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 5;
}
.mnyra-an__tooltip--visible { opacity: 1; }
.mnyra-an__tooltip-value { font-weight: 800; }
.mnyra-an__tooltip-key { display: inline-block; width: 10px; height: 2px; border-radius: 1px; vertical-align: middle; margin-right: 5px; }
.mnyra-an__table { width: 100%; border-collapse: collapse; font-size: 12px; }
.mnyra-an__table th {
  text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--an-muted); padding: 6px 8px; border-bottom: 1px solid var(--an-grid);
}
.mnyra-an__table td { padding: 8px; border-bottom: 1px solid var(--an-grid); color: var(--an-ink-2); font-variant-numeric: tabular-nums; }
.mnyra-an__table td:first-child { color: var(--an-ink); font-weight: 600; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-an__table tr:last-child td { border-bottom: none; }
.mnyra-an__table-scroll { overflow-x: auto; }
.mnyra-an__bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.mnyra-an__bar-label { flex: 0 0 128px; font-size: 11px; font-weight: 700; color: var(--an-ink-2); }
.mnyra-an__bar-track { flex: 1; height: 16px; background: var(--an-plane); border-radius: 6px; overflow: hidden; }
.mnyra-an__bar-fill { height: 100%; border-radius: 4px; background: var(--an-series-1); min-width: 2px; }
.mnyra-an__bar-value { flex: 0 0 auto; font-size: 11px; font-weight: 700; color: var(--an-ink); font-variant-numeric: tabular-nums; }
.mnyra-an__state { padding: 34px 18px; text-align: center; }
.mnyra-an__state-title { font-size: 14px; font-weight: 800; color: var(--an-ink); margin: 0 0 6px; }
.mnyra-an__state-body { font-size: 12px; color: var(--an-ink-2); margin: 0; line-height: 1.6; }
.mnyra-an__retry {
  margin-top: 14px; border: none; background: var(--an-chip-active); color: var(--an-chip-active-ink);
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em;
  padding: 10px 18px; border-radius: 999px; cursor: pointer;
}
.mnyra-an__skeleton { border-radius: 20px; background: var(--an-plane); animation: mnyraAnPulse 1.4s ease-in-out infinite; }
@keyframes mnyraAnPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
.mnyra-an__empty-note { font-size: 11px; color: var(--an-muted); margin: 6px 0 0; }
`;

export function ensureAnalyticsStylesInjected(documentObj = typeof document === "undefined" ? null : document) {
  if (!documentObj || documentObj.getElementById(STYLE_ELEMENT_ID)) return;
  try {
    const style = documentObj.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    style.textContent = ANALYTICS_DASHBOARD_CSS;
    documentObj.head?.appendChild(style);
  } catch {}
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDayShort(dayKey = "") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dayKey || ""));
  if (!match) return dayKey;
  return `${match[3]}.${match[2]}.`;
}

export function renderAnalyticsRangeFilter({ rangeKey = "7d", customFrom = "", customTo = "" } = {}) {
  const chips = ANALYTICS_RANGE_PRESETS.map((preset) => `
    <button
      type="button"
      class="mnyra-an__chip ${preset.key === rangeKey ? "mnyra-an__chip--active" : ""}"
      data-analytics-range="${escapeHtml(preset.key)}"
    >${escapeHtml(preset.label)}</button>
  `).join("");
  const customRow = rangeKey === "custom"
    ? `
      <div class="mnyra-an__custom">
        <input type="date" data-analytics-custom-from value="${escapeHtml(customFrom)}" aria-label="Nga" />
        <span style="color:var(--an-muted); font-size:11px; font-weight:700;">bis</span>
        <input type="date" data-analytics-custom-to value="${escapeHtml(customTo)}" aria-label="Deri" />
        <button type="button" class="mnyra-an__chip mnyra-an__chip--active" data-analytics-custom-apply>Anwenden</button>
      </div>
    `
    : "";
  return `<div class="mnyra-an__filters" role="group" aria-label="Periudha">${chips}</div>${customRow}`;
}

function renderDelta(delta, { moreIsGood = true } = {}) {
  if (delta === undefined) return "";
  const label = formatDeltaLabel(delta);
  let cls = "";
  if (delta !== null && delta !== 0) {
    const isUp = delta > 0;
    const isGood = moreIsGood ? isUp : !isUp;
    cls = isGood ? "mnyra-an__kpi-delta--up" : "mnyra-an__kpi-delta--down";
  }
  return `<p class="mnyra-an__kpi-delta ${cls}">${escapeHtml(label)} <span style="color:var(--an-muted); font-weight:600;">vs. Vorperiode</span></p>`;
}

export function renderKpiCard({ label = "", value = 0, delta, suffix = "", moreIsGood = true } = {}) {
  return `
    <div class="mnyra-an__card">
      <p class="mnyra-an__kpi-label">${escapeHtml(label)}</p>
      <p class="mnyra-an__kpi-value">${escapeHtml(formatCompactNumber(value))}${suffix ? ` <span style="font-size:12px; color:var(--an-muted); font-weight:700;">${escapeHtml(suffix)}</span>` : ""}</p>
      ${renderDelta(delta, { moreIsGood })}
    </div>
  `;
}

// Mehrserien-Trend als SVG-Liniendiagramm mit Crosshair-Tooltip-Daten.
// Serien: [{ key, label, color ("1"|"2"), points: [{day, value}] }]
export function renderTrendChart({ series = [], chartId = "trend", height = 150 } = {}) {
  const safeSeries = (Array.isArray(series) ? series : []).filter((entry) => Array.isArray(entry?.points) && entry.points.length);
  if (!safeSeries.length) return "";
  const width = 640;
  const pad = { top: 12, right: 12, bottom: 24, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const days = safeSeries[0].points.map((point) => point.day);
  const pointCount = days.length;
  const maxValue = Math.max(1, ...safeSeries.flatMap((entry) => entry.points.map((point) => Number(point.value) || 0)));
  const niceMax = Math.max(1, Math.ceil(maxValue / 4) * 4);
  const xFor = (index) => pad.left + (pointCount <= 1 ? innerW / 2 : (index / (pointCount - 1)) * innerW);
  const yFor = (value) => pad.top + innerH - (Math.max(0, Number(value) || 0) / niceMax) * innerH;
  const colorVar = (colorKey) => (String(colorKey) === "2" ? "var(--an-series-2)" : "var(--an-series-1)");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = pad.top + innerH - ratio * innerH;
    const tick = Math.round(niceMax * ratio);
    return `
      <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="var(--an-grid)" stroke-width="1" />
      <text x="${pad.left - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="var(--an-muted)" style="font-variant-numeric: tabular-nums;">${tick.toLocaleString("de-DE")}</text>
    `;
  }).join("");

  const xLabelStep = Math.max(1, Math.ceil(pointCount / 6));
  const xLabels = days.map((day, index) => {
    if (index % xLabelStep !== 0 && index !== pointCount - 1) return "";
    return `<text x="${xFor(index)}" y="${height - 6}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${escapeHtml(formatDayShort(day))}</text>`;
  }).join("");

  const paths = safeSeries.map((entry) => {
    const lineD = entry.points.map((point, index) => `${index === 0 ? "M" : "L"}${xFor(index).toFixed(1)},${yFor(point.value).toFixed(1)}`).join(" ");
    const areaD = `${lineD} L${xFor(pointCount - 1).toFixed(1)},${(pad.top + innerH).toFixed(1)} L${xFor(0).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z`;
    const lastIndex = pointCount - 1;
    const endDot = `<circle cx="${xFor(lastIndex).toFixed(1)}" cy="${yFor(entry.points[lastIndex].value).toFixed(1)}" r="4" fill="${colorVar(entry.color)}" stroke="var(--an-surface)" stroke-width="2" />`;
    return `
      <path d="${areaD}" fill="${colorVar(entry.color)}" opacity="0.10" />
      <path d="${lineD}" fill="none" stroke="${colorVar(entry.color)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${endDot}
    `;
  }).join("");

  const legend = safeSeries.length > 1
    ? `
      <div class="mnyra-an__legend">
        ${safeSeries.map((entry) => `
          <span class="mnyra-an__legend-item">
            <span class="mnyra-an__legend-swatch" style="background:${colorVar(entry.color)};"></span>${escapeHtml(entry.label)}
          </span>
        `).join("")}
      </div>
    `
    : "";

  const tooltipPayload = escapeHtml(JSON.stringify({
    days,
    pad,
    width,
    height,
    series: safeSeries.map((entry) => ({
      label: entry.label,
      color: String(entry.color) === "2" ? "2" : "1",
      values: entry.points.map((point) => Number(point.value) || 0)
    }))
  }));

  return `
    ${legend}
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${escapeHtml(chartId)}" data-analytics-chart-payload="${tooltipPayload}">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="Trend">
        ${gridLines}
        <line data-analytics-crosshair x1="0" y1="${pad.top}" x2="0" y2="${pad.top + innerH}" stroke="var(--an-muted)" stroke-width="1" opacity="0" />
        ${paths}
        ${xLabels}
      </svg>
      <div class="mnyra-an__tooltip" data-analytics-tooltip></div>
    </div>
  `;
}

// 24h-Balkenchart (eine Serie, sequentiell eingefaerbt).
export function renderHourlyChart({ rows = [], label = "", chartId = "hourly" } = {}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const total = safeRows.reduce((sum, row) => sum + (Number(row?.value) || 0), 0);
  if (total <= 0) {
    return `<p class="mnyra-an__empty-note">Ende nuk ka te dhena per „${escapeHtml(label)}“ ne kete periudhe.</p>`;
  }
  const width = 640;
  const height = 120;
  const pad = { top: 8, right: 8, bottom: 20, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxValue = Math.max(1, ...safeRows.map((row) => Number(row?.value) || 0));
  const slot = innerW / 24;
  const barW = Math.min(20, Math.max(6, slot - 2));
  const bars = safeRows.map((row) => {
    const value = Number(row?.value) || 0;
    const h = value <= 0 ? 0 : Math.max(2, (value / maxValue) * innerH);
    const x = pad.left + row.hour * slot + (slot - barW) / 2;
    const y = pad.top + innerH - h;
    return value <= 0
      ? ""
      : `<path d="M${x.toFixed(1)},${(pad.top + innerH).toFixed(1)} L${x.toFixed(1)},${(y + 4).toFixed(1)} Q${x.toFixed(1)},${y.toFixed(1)} ${(x + 4).toFixed(1)},${y.toFixed(1)} L${(x + barW - 4).toFixed(1)},${y.toFixed(1)} Q${(x + barW).toFixed(1)},${y.toFixed(1)} ${(x + barW).toFixed(1)},${(y + 4).toFixed(1)} L${(x + barW).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z"
          fill="var(--an-series-1)"><title>${escapeHtml(`${row.hour}:00 Uhr – ${value.toLocaleString("de-DE")}`)}</title></path>`;
  }).join("");
  const labels = [0, 6, 12, 18, 23].map((hour) => `
    <text x="${(pad.left + hour * slot + slot / 2).toFixed(1)}" y="${height - 5}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${hour} Uhr</text>
  `).join("");
  return `
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${escapeHtml(chartId)}">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="${escapeHtml(label)}">
        <line x1="${pad.left}" y1="${pad.top + innerH}" x2="${width - pad.right}" y2="${pad.top + innerH}" stroke="var(--an-grid)" stroke-width="1" />
        ${bars}
        ${labels}
      </svg>
    </div>
  `;
}

export function renderFunnel(funnel = []) {
  const steps = Array.isArray(funnel) ? funnel : [];
  if (!steps.length) return "";
  const max = Math.max(1, ...steps.map((step) => Number(step?.value) || 0));
  return steps.map((step, index) => {
    const value = Number(step?.value) || 0;
    const widthPct = Math.max(2, Math.round((value / max) * 100));
    const dropLabel = index > 0 && step.dropFromPrev > 0
      ? ` <span style="color:var(--an-down);">(−${step.dropFromPrev.toLocaleString("de-DE")} %)</span>`
      : "";
    return `
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${escapeHtml(step.label)}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${widthPct}%; opacity:${1 - index * 0.15};"></div></div>
        <span class="mnyra-an__bar-value">${escapeHtml(formatCompactNumber(value))}${dropLabel}</span>
      </div>
    `;
  }).join("");
}

export function renderBreakdownBars(rows = [], { labelKey = "label", valueKey = "count", suffix = "" } = {}) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeRows.length) return `<p class="mnyra-an__empty-note">Ende nuk ka te dhena ne kete periudhe.</p>`;
  const max = Math.max(1, ...safeRows.map((row) => Number(row?.[valueKey]) || 0));
  return safeRows.map((row) => {
    const value = Number(row?.[valueKey]) || 0;
    const widthPct = Math.max(2, Math.round((value / max) * 100));
    const shareLabel = suffix === "%" && Number.isFinite(Number(row?.share))
      ? ` · ${Number(row.share).toLocaleString("de-DE")} %`
      : "";
    return `
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${escapeHtml(String(row?.[labelKey] || ""))}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${widthPct}%;"></div></div>
        <span class="mnyra-an__bar-value">${escapeHtml(formatCompactNumber(value))}${escapeHtml(shareLabel)}</span>
      </div>
    `;
  }).join("");
}

export function renderAnalyticsTable({ columns = [], rows = [], emptyLabel = "Ende nuk ka te dhena." } = {}) {
  if (!rows.length) return `<p class="mnyra-an__empty-note">${escapeHtml(emptyLabel)}</p>`;
  return `
    <div class="mnyra-an__table-scroll">
      <table class="mnyra-an__table">
        <thead><tr>${columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>${columns.map((col) => `<td>${escapeHtml(String(col.render ? col.render(row) : row[col.key] ?? ""))}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderAnalyticsLoadingState() {
  return `
    <div class="mnyra-an__grid" aria-hidden="true">
      ${Array.from({ length: 4 }, () => `<div class="mnyra-an__skeleton" style="height:88px;"></div>`).join("")}
    </div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:180px;"></div></div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:140px;"></div></div>
  `;
}

export function renderAnalyticsEmptyState({ title = "Ende nuk ka te dhena analitike", body = "" } = {}) {
  return `
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">${escapeHtml(title)}</p>
      <p class="mnyra-an__state-body">${escapeHtml(body || "Sapo vizitoret te shikojne profilin, menune ose postimet e tua, statistikat e tua shfaqen ketu.")}</p>
    </div>
  `;
}

export function renderAnalyticsErrorState({ message = "" } = {}) {
  return `
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">Analitika nuk mund te ngarkohej</p>
      <p class="mnyra-an__state-body">${escapeHtml(message || "Ju lutem kontrolloni lidhjen dhe provoni perseri.")}</p>
      <button type="button" class="mnyra-an__retry" data-analytics-retry>Provo perseri</button>
    </div>
  `;
}

// Komplettes Dashboard aus dem Modell (analytics-dashboard-core.buildAnalyticsDashboardModel).
export function renderAnalyticsDashboard(model = null, { currency = "€" } = {}) {
  if (!model) return renderAnalyticsEmptyState({});
  const { summary, deltas } = model;
  if (!model.hasAnyData) {
    return renderAnalyticsEmptyState({
      body: `Ne periudhen „${model.range.label}“ ende nuk ka te dhena. Ndaj profilin tend, QR kodet e tua ose posto ne feed per te rritur shtrirjen.`
    });
  }
  const kpis = [
    renderKpiCard({ label: "Vizitore te profilit", value: summary.profileViews, delta: deltas.profileViews }),
    renderKpiCard({ label: "Vizitore unike", value: summary.uniqueVisitors, delta: deltas.uniqueVisitors }),
    renderKpiCard({ label: "Shikime te menuse", value: summary.menuOpens, delta: deltas.menuOpens }),
    renderKpiCard({ label: "Produkt-Ansichten", value: summary.productViews, delta: deltas.productViews }),
    renderKpiCard({ label: "Beitrags-Impressionen", value: summary.postImpressions, delta: deltas.postImpressions }),
    renderKpiCard({ label: "QR-Scans", value: summary.qrScans, delta: deltas.qrScans }),
    renderKpiCard({ label: "Thirrje kamarieri", value: summary.waiterCalls, delta: deltas.waiterCalls }),
    renderKpiCard({ label: "Porosite", value: summary.ordersCompleted, delta: deltas.ordersCompleted }),
    renderKpiCard({ label: "Umsatz", value: summary.revenue, delta: deltas.revenue, suffix: currency }),
    renderKpiCard({ label: "Ø Bestellwert", value: summary.avgOrderValue, suffix: currency }),
    renderKpiCard({ label: "Shtrirja ne feed", value: summary.feedImpressions, delta: deltas.feedImpressions }),
    renderKpiCard({ label: "Feed-Klickrate", value: summary.feedCtr, suffix: "%" })
  ].join("");

  const trend = renderTrendChart({
    chartId: "profileTrend",
    series: [
      { key: "profileViews", label: "Vizitore te profilit", color: "1", points: model.trend.profileViews },
      { key: "menuOpens", label: "Shikime te menuse", color: "2", points: model.trend.menuOpens }
    ]
  });

  const topProductsTable = renderAnalyticsTable({
    columns: [
      { key: "name", label: "Produkt" },
      { key: "views", label: "Ansichten" },
      { key: "orders", label: "Porosite" },
      { key: "revenue", label: `Umsatz (${currency})`, render: (row) => (row.revenue > 0 ? row.revenue.toLocaleString("de-DE") : "–") }
    ],
    rows: model.topProducts,
    emptyLabel: "Ende nuk ka te dhena produktesh ne kete periudhe."
  });

  const lowProductsTable = model.lowProducts.length && model.topProducts.length > model.lowProducts.length
    ? `
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Wenig Aufmerksamkeit</h3>
        <div class="mnyra-an__card">
          ${renderAnalyticsTable({
            columns: [
              { key: "name", label: "Produkt" },
              { key: "views", label: "Ansichten" },
              { key: "orders", label: "Porosite" }
            ],
            rows: model.lowProducts
          })}
          <p class="mnyra-an__empty-note">Keshille: Keto produkte marrin pak vemendje – foto me te mira, pozicioni ne menu ose nje oferte mund te ndihmojne.</p>
        </div>
      </div>
    `
    : "";

  const topPostsTable = renderAnalyticsTable({
    columns: [
      { key: "postId", label: "Beitrag" },
      { key: "impressions", label: "Impressionen" },
      { key: "clicks", label: "Klicks" },
      { key: "likes", label: "Likes" },
      { key: "ctr", label: "CTR %", render: (row) => row.ctr.toLocaleString("de-DE") }
    ],
    rows: model.topPosts,
    emptyLabel: "Ende nuk ka te dhena postimesh ne kete periudhe."
  });

  const tablesTable = model.tables.length
    ? `
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Tavolinat</h3>
        <div class="mnyra-an__card">
          ${renderAnalyticsTable({
            columns: [
              { key: "label", label: "Tavolina" },
              { key: "qrScans", label: "QR-Scans" },
              { key: "waiterCalls", label: "Thirrje kamarieri" },
              { key: "ordersCompleted", label: "Porosite" }
            ],
            rows: model.tables
          })}
        </div>
      </div>
    `
    : "";

  const categoriesSection = model.categories.length
    ? `
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kategorien</h3>
        <div class="mnyra-an__card">
          ${renderBreakdownBars(model.categories, { labelKey: "name", valueKey: "opens" })}
        </div>
      </div>
    `
    : "";

  const contactsRows = [
    { label: "Telefon", count: model.contacts.phone },
    { label: "Adresa", count: model.contacts.address },
    { label: "Harta", count: model.contacts.map },
    { label: "Öffnungszeiten", count: model.contacts.hours },
    { label: "Social Links", count: model.contacts.social }
  ].filter((row) => row.count > 0);

  return `
    <div class="mnyra-an__grid">${kpis}</div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Trend</h3>
      <div class="mnyra-an__card">${trend || `<p class="mnyra-an__empty-note">Kein Trend für diesen Zeitraum.</p>`}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Conversion-Funnel</h3>
      <div class="mnyra-an__card">
        ${renderFunnel(model.funnel)}
        <p class="mnyra-an__empty-note">Konvertimi menu → porosi: ${escapeHtml(String(summary.orderConversion.toLocaleString("de-DE")))} % · Porosi me QR: ${escapeHtml(formatCompactNumber(summary.ordersQr))} · Te jashtme: ${escapeHtml(formatCompactNumber(summary.ordersExternal))}</p>
      </div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Klickquellen</h3>
      <div class="mnyra-an__card">${renderBreakdownBars(model.sources, { suffix: "%" })}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Produkte</h3>
      <div class="mnyra-an__card">${topProductsTable}</div>
    </div>
    ${lowProductsTable}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Beiträge</h3>
      <div class="mnyra-an__card">${topPostsTable}</div>
    </div>

    ${categoriesSection}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">QR-Scans nach Uhrzeit</h3>
      <div class="mnyra-an__card">${renderHourlyChart({ rows: model.hourlyQr, label: "QR-Scans", chartId: "hourlyQr" })}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Thirrjet e kamarierit sipas ores</h3>
      <div class="mnyra-an__card">${renderHourlyChart({ rows: model.hourlyWaiter, label: "Thirrje kamarieri", chartId: "hourlyWaiter" })}</div>
    </div>

    ${contactsRows.length ? `
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kontakt-Klicks</h3>
        <div class="mnyra-an__card">${renderBreakdownBars(contactsRows)}</div>
      </div>
    ` : ""}

    ${tablesTable}
  `;
}

// Crosshair-Tooltip fuer Trend-Charts: einmal pro Container binden.
export function bindAnalyticsChartInteractions(rootNode = typeof document === "undefined" ? null : document) {
  if (!rootNode?.querySelectorAll) return;
  rootNode.querySelectorAll("[data-analytics-chart-payload]").forEach((wrap) => {
    if (wrap.__mnyraAnalyticsChartBound) return;
    wrap.__mnyraAnalyticsChartBound = true;
    let payload = null;
    try {
      payload = JSON.parse(wrap.getAttribute("data-analytics-chart-payload") || "null");
    } catch {}
    if (!payload || !Array.isArray(payload.days) || !payload.days.length) return;
    const svg = wrap.querySelector("svg");
    const crosshair = wrap.querySelector("[data-analytics-crosshair]");
    const tooltip = wrap.querySelector("[data-analytics-tooltip]");
    if (!svg || !crosshair || !tooltip) return;
    const { pad, width } = payload;
    const innerW = width - pad.left - pad.right;
    const pointCount = payload.days.length;

    const hide = () => {
      crosshair.setAttribute("opacity", "0");
      tooltip.classList.remove("mnyra-an__tooltip--visible");
    };

    const handleMove = (event) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const scale = width / rect.width;
      const localX = (event.clientX - rect.left) * scale;
      const ratio = Math.min(1, Math.max(0, (localX - pad.left) / Math.max(1, innerW)));
      const index = Math.round(ratio * (pointCount - 1));
      const snappedX = pad.left + (pointCount <= 1 ? innerW / 2 : (index / (pointCount - 1)) * innerW);
      crosshair.setAttribute("x1", String(snappedX));
      crosshair.setAttribute("x2", String(snappedX));
      crosshair.setAttribute("opacity", "0.6");
      // Tooltip-Inhalt sicher aufbauen (textContent, kein innerHTML mit Daten).
      tooltip.textContent = "";
      const dayLine = rootNode.createElement ? rootNode.createElement("div") : document.createElement("div");
      dayLine.textContent = formatDayShort(payload.days[index]);
      dayLine.style.fontWeight = "800";
      tooltip.appendChild(dayLine);
      payload.series.forEach((entry) => {
        const row = document.createElement("div");
        const key = document.createElement("span");
        key.className = "mnyra-an__tooltip-key";
        key.style.background = entry.color === "2" ? "var(--an-series-2)" : "var(--an-series-1)";
        const value = document.createElement("span");
        value.className = "mnyra-an__tooltip-value";
        value.textContent = Number(entry.values[index] || 0).toLocaleString("de-DE");
        const label = document.createElement("span");
        label.textContent = ` ${entry.label}`;
        row.appendChild(key);
        row.appendChild(value);
        row.appendChild(label);
        tooltip.appendChild(row);
      });
      tooltip.style.left = `${(snappedX / width) * 100}%`;
      tooltip.style.top = "0px";
      tooltip.classList.add("mnyra-an__tooltip--visible");
    };

    svg.addEventListener("pointermove", handleMove);
    svg.addEventListener("pointerdown", handleMove);
    svg.addEventListener("pointerleave", hide);
  });
}
