import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatRelative,
  renderBadge,
  renderEmptyState
} from "./heart-ui-utils.js";

const FILTERS = Object.freeze([
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Freigegeben" },
  { key: "rejected", label: "Abgelehnt" },
  { key: "all", label: "Alle" }
]);

function normalizeStatus(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (key === "approved") return "approved";
  if (key === "rejected") return "rejected";
  return "pending";
}

function getStatusTone(status = "") {
  const key = normalizeStatus(status);
  if (key === "approved") return "success";
  if (key === "rejected") return "danger";
  return "warning";
}

function getStatusLabel(status = "") {
  const key = normalizeStatus(status);
  if (key === "approved") return "Freigegeben";
  if (key === "rejected") return "Abgelehnt";
  return "Pending";
}

function filterAds(items = [], filter = "pending") {
  const safeFilter = String(filter || "pending").trim();
  const list = Array.isArray(items) ? items : [];
  if (safeFilter === "all") return list;
  return list.filter((item) => normalizeStatus(item.reviewStatus || item.approvalStatus) === safeFilter);
}

function renderSummary(items = []) {
  const pending = items.filter((item) => normalizeStatus(item.reviewStatus) === "pending").length;
  const approved = items.filter((item) => normalizeStatus(item.reviewStatus) === "approved").length;
  const rejected = items.filter((item) => normalizeStatus(item.reviewStatus) === "rejected").length;
  return `
    <section class="heart-hero-grid heart-hero-grid--small">
      <article class="heart-kpi-card heart-kpi-card--warning">
        <p class="heart-eyebrow">Pending</p>
        <h2>${escapeHtml(String(pending))}</h2>
        <p class="heart-kpi-card__summary">Warten auf CEO-Freigabe.</p>
      </article>
      <article class="heart-kpi-card">
        <p class="heart-eyebrow">Live</p>
        <h2>${escapeHtml(String(approved))}</h2>
        <p class="heart-kpi-card__summary">Koennen im Restaurant-Tab erscheinen.</p>
      </article>
      <article class="heart-kpi-card heart-kpi-card--critical">
        <p class="heart-eyebrow">Abgelehnt</p>
        <h2>${escapeHtml(String(rejected))}</h2>
        <p class="heart-kpi-card__summary">Bleiben fuer User verborgen.</p>
      </article>
    </section>
  `;
}

function renderFilterRow(activeFilter = "pending") {
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Filter</p>
          <h2>Ad-Freigabe</h2>
        </div>
      </div>
      <div class="heart-chip-row">
        ${FILTERS.map((filter) => `
          <button class="heart-chip ${filter.key === activeFilter ? "heart-crm-chip--dark" : ""}" data-action="set-ads-filter" data-ads-filter="${escapeHtml(filter.key)}">
            ${escapeHtml(filter.label)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAdImage(item = {}) {
  const imageUrl = String(item.imageUrl || "").trim();
  if (!imageUrl) {
    return `
      <div class="heart-empty-state__icon" aria-hidden="true">
        ${renderHeartIcon("image")}
      </div>
    `;
  }
  return `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy" decoding="async" style="width:76px;height:76px;border-radius:18px;object-fit:cover;border:1px solid rgba(255,255,255,0.08);" />`;
}

function renderAdCard(item = {}, adsState = {}) {
  const status = normalizeStatus(item.reviewStatus || item.approvalStatus);
  const busy = String(adsState.updatingId || "") === `${item.restaurantId}:${item.id}`;
  return `
    <article class="heart-list-card">
      <div class="heart-list-card__head">
        <div style="display:flex;align-items:flex-start;gap:14px;min-width:0;">
          ${renderAdImage(item)}
          <div style="min-width:0;">
            <strong>${escapeHtml(item.title || "Ad")}</strong>
            <p>${escapeHtml(item.restaurantName || item.restaurantId || "Restaurant")}</p>
            <div class="heart-list-card__meta">
              <span>${escapeHtml(item.adCategory || "RESTAURANT")}</span>
              ${item.priceSegment ? `<span>${escapeHtml(item.priceSegment)}</span>` : ""}
              ${item.restaurantCity ? `<span>${escapeHtml(item.restaurantCity)}</span>` : ""}
              ${item.reviewRequestedAt ? `<span>${escapeHtml(formatRelative(item.reviewRequestedAt))}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="heart-list-card__badges">
          ${renderBadge(getStatusLabel(status), getStatusTone(status))}
        </div>
      </div>
      ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ""}
      <div class="heart-detail-grid">
        <div><span>Restaurant</span><strong>${escapeHtml(item.restaurantId || "-")}</strong></div>
        <div><span>Wolt</span><strong>${escapeHtml(item.woltEnabled ? "Aktiv" : "Aus")}</strong></div>
        <div><span>Badge 1</span><strong>${escapeHtml(item.choiceBadge || "-")}</strong></div>
        <div><span>Badge 2</span><strong>${escapeHtml(item.deliveryBadge || "-")}</strong></div>
      </div>
      <div class="heart-filter-row" style="margin-top:14px;">
        <button class="heart-button heart-button--dark" data-action="review-ad" data-restaurant-id="${escapeHtml(item.restaurantId)}" data-ad-id="${escapeHtml(item.id)}" data-review-status="approved" ${busy || status === "approved" ? "disabled" : ""}>
          Freigeben
        </button>
        <button class="heart-button heart-button--secondary" data-action="review-ad" data-restaurant-id="${escapeHtml(item.restaurantId)}" data-ad-id="${escapeHtml(item.id)}" data-review-status="rejected" ${busy || status === "rejected" ? "disabled" : ""}>
          Ablehnen
        </button>
      </div>
    </article>
  `;
}

export function renderAdsView(adsState = {}) {
  const items = Array.isArray(adsState.items) ? adsState.items : [];
  const activeFilter = String(adsState.filter || "pending").trim() || "pending";
  const filtered = filterAds(items, activeFilter);
  if (adsState.status === "loading" && !items.length) {
    return `<section class="heart-section"><div class="heart-loading-block">Ads werden geladen...</div></section>`;
  }
  if (adsState.status === "error" && !items.length) {
    return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(adsState.error || "Ads konnten nicht geladen werden.")}</div></section>`;
  }
  return `
    <div class="heart-view-stack">
      ${renderSummary(items)}
      ${renderFilterRow(activeFilter)}
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Treffer</p>
            <h2>${escapeHtml(String(filtered.length))} Ads sichtbar</h2>
          </div>
          ${adsState.lastRefreshAt ? `<span class="heart-chip">Update ${escapeHtml(formatRelative(adsState.lastRefreshAt))}</span>` : ""}
        </div>
        ${adsState.error ? `<div class="heart-error-block">${escapeHtml(adsState.error)}</div>` : ""}
        ${filtered.length ? `
          <div class="heart-list-stack">
            ${filtered.map((item) => renderAdCard(item, adsState)).join("")}
          </div>
        ` : renderEmptyState({
          title: "Keine Ads in diesem Filter.",
          message: "Sobald Restaurants Ads einreichen, erscheinen sie hier zur Freigabe."
        })}
      </section>
    </div>
  `;
}
