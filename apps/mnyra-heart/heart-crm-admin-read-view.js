import {
  HEART_CRM_ADMIN_CONSUMER_MODE,
  HEART_CRM_ADMIN_READ_LOADER_DEPS,
  createHeartCrmAdminShellConsumer
} from "./heart-crm-admin-shell-consumer.js";
import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  renderBadge
} from "./heart-ui-utils.js";

export const HEART_CRM_ADMIN_READ_VIEW_MISSING_DEPS = Object.freeze({
  leads: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.leads]),
  customers: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.customers]),
  staff: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.staff]),
  businessAccounts: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.businessAccounts])
});

const CRM_READ_SECTIONS = Object.freeze([
  { key: "leads", title: "Leads", icon: "list" },
  { key: "customers", title: "Customers", icon: "user" },
  { key: "staff", title: "Staff", icon: "users" },
  { key: "businessAccounts", title: "Business Accounts", icon: "chart" }
]);

function formatMissingDeps(domainKey = "") {
  return (HEART_CRM_ADMIN_READ_VIEW_MISSING_DEPS[domainKey] || []).join(", ");
}

function createReadConsumer(consumerDeps) {
  try {
    return {
      consumer: createHeartCrmAdminShellConsumer(consumerDeps),
      error: ""
    };
  } catch (error) {
    return {
      consumer: null,
      error: error?.message || "CRM consumer konnte nicht vorbereitet werden."
    };
  }
}

function getSectionStatusLabel(sectionState = {}, ready = false) {
  const status = String(sectionState?.status || "").trim();
  if (!ready) return "Deps pending";
  if (status === "loading") return "Loading";
  if (status === "error") return "Error";
  if (status === "missing") return "Deps pending";
  return "Read-only";
}

function getSectionBadgeTone(sectionState = {}, ready = false) {
  const status = String(sectionState?.status || "").trim();
  if (!ready || status === "missing") return "warning";
  if (status === "error") return "danger";
  return "info";
}

function getItemTitle(sectionKey = "", item = {}) {
  if (sectionKey === "leads") return item.businessName || item.restaurantName || item.name || item.email || item.id || "-";
  if (sectionKey === "customers") return item.name || item.restaurantName || item.ownerEmail || item.id || "-";
  if (sectionKey === "staff") return item.name || item.displayName || item.email || item.uid || "-";
  if (sectionKey === "businessAccounts") return item.name || item.email || item.uid || "-";
  return item.name || item.id || "-";
}

function getItemMeta(sectionKey = "", item = {}) {
  if (sectionKey === "leads") return [item.status, item.city, item.email].filter(Boolean).join(" | ");
  if (sectionKey === "customers") return [item.status || "kunde", item.city, item.ownerEmail].filter(Boolean).join(" | ");
  if (sectionKey === "staff") return [item.country, item.email].filter(Boolean).join(" | ");
  if (sectionKey === "businessAccounts") return [item.role, item.status, item.email].filter(Boolean).join(" | ");
  return "";
}

function renderSectionItems(sectionKey = "", items = []) {
  const list = Array.isArray(items) ? items.slice(0, 4) : [];
  if (!list.length) return '<p class="heart-section__note">Keine Eintraege im aktuellen read-only Abruf.</p>';
  return `
    <div class="heart-detail-grid">
      ${list.map((item) => {
        const title = getItemTitle(sectionKey, item);
        const meta = getItemMeta(sectionKey, item);
        return `
          <div>
            <span>${escapeHtml(meta || "Read-only")}</span>
            <strong>${escapeHtml(title)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCrmReadSection(section, consumer, crmAdmin = {}) {
  const domain = consumer?.[section.key] || null;
  const ready = typeof domain?.load === "function" && domain.ready === true;
  const sectionState = crmAdmin?.sections?.[section.key] || {};
  const sectionStatus = String(sectionState.status || "").trim();
  const items = Array.isArray(sectionState.items) ? sectionState.items : [];
  const missingDeps = Array.isArray(domain?.missingDeps) && domain.missingDeps.length
    ? domain.missingDeps.join(", ")
    : formatMissingDeps(section.key);
  const missingContext = String(sectionState.missingContext || "").trim();
  const note = !ready
    ? `Read loader fehlt: ${missingDeps}.`
    : sectionStatus === "loading"
      ? "Read-only Datenabruf laeuft."
      : sectionStatus === "error"
        ? (sectionState.error || "Read-only Datenabruf fehlgeschlagen.")
        : missingContext
          ? `Runtime-Kontext fehlt: ${missingContext}.`
          : "Read-only Datenabruf ist aktiv.";
  const countLabel = ready && sectionStatus === "ready"
    ? `${sectionState.countExact === false ? `${sectionState.knownCount || items.length}+` : sectionState.knownCount || items.length}`
    : ready
      ? (sectionStatus === "loading" ? "Laden..." : "Bereit")
      : "Nicht geladen";

  return `
    <article class="heart-dashboard-metric">
      <div class="heart-dashboard-metric__top">
        <span class="heart-dashboard-metric__icon">${renderHeartIcon(section.icon)}</span>
        ${renderBadge(getSectionStatusLabel(sectionState, ready), getSectionBadgeTone(sectionState, ready))}
      </div>
      <div class="heart-dashboard-metric__body">
        <strong>${escapeHtml(section.title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="heart-meta-row">
        <span>Count</span>
        <strong>${escapeHtml(countLabel)}</strong>
      </div>
      ${ready && sectionStatus === "ready"
        ? renderSectionItems(section.key, items)
        : ready && sectionStatus === "loading"
          ? '<p class="heart-section__note">Read-only Liste wird geladen.</p>'
          : ready && sectionStatus === "error"
            ? `<p class="heart-section__note">${escapeHtml(sectionState.error || "Read-only Abruf fehlgeschlagen.")}</p>`
            : ready
              ? '<p class="heart-section__note">Noch kein read-only Abruf in dieser Session.</p>'
              : `<p class="heart-section__note">Fehlende Runtime-Abhaengigkeit: ${escapeHtml(missingDeps)}.</p>`}
    </article>
  `;
}

export function renderHeartCrmAdminReadView({ consumerDeps = {}, crmAdmin = null } = {}) {
  const {
    consumer,
    error
  } = createReadConsumer(consumerDeps);
  const mode = consumer?.mode || HEART_CRM_ADMIN_CONSUMER_MODE;
  const missingReadDeps = Array.isArray(consumer?.contract?.missingReadDeps)
    ? consumer.contract.missingReadDeps
    : Object.values(HEART_CRM_ADMIN_READ_LOADER_DEPS);
  const readLoadersReady = consumer?.contract?.readLoadersReady === true;

  // READ-ONLY future Heart/Admin migration seam. Real loads require explicit loader deps.
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">CRM/Admin</p>
            <h2>Read-only Verbindung</h2>
          </div>
          ${renderBadge(mode, "info")}
        </div>
        <p class="heart-section__note">
          Heart nutzt den CRM/Admin Consumer. ${readLoadersReady
            ? "Die read-only Loader sind verbunden."
            : `Live-Daten bleiben aus, bis diese Loader bereitstehen: ${escapeHtml(missingReadDeps.join(", "))}.`}
        </p>
        ${error ? `<div class="heart-error-block">${escapeHtml(error)}</div>` : ""}
      </section>
      <div class="heart-dashboard-metrics">
        ${CRM_READ_SECTIONS.map((section) => renderCrmReadSection(section, consumer, crmAdmin || {})).join("")}
      </div>
    </div>
  `;
}
