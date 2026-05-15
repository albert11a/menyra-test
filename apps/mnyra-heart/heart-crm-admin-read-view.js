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

function renderCrmReadSection(section, consumer) {
  const domain = consumer?.[section.key] || null;
  const ready = typeof domain?.load === "function" && domain.ready === true;
  const missingDeps = Array.isArray(domain?.missingDeps) && domain.missingDeps.length
    ? domain.missingDeps.join(", ")
    : formatMissingDeps(section.key);
  const note = ready
    ? "Read loader ist verbunden. Datenabruf bleibt read-only."
    : `Read loader fehlt: ${missingDeps}.`;

  return `
    <article class="heart-dashboard-metric">
      <div class="heart-dashboard-metric__top">
        <span class="heart-dashboard-metric__icon">${renderHeartIcon(section.icon)}</span>
        ${renderBadge(ready ? "Read-only" : "Deps pending", ready ? "info" : "warning")}
      </div>
      <div class="heart-dashboard-metric__body">
        <strong>${escapeHtml(section.title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="heart-meta-row">
        <span>Count</span>
        <strong>${escapeHtml(ready ? "Bereit" : "Nicht geladen")}</strong>
      </div>
      ${ready
        ? '<p class="heart-section__note">Liste: wartet auf den expliziten read-only Abrufschritt.</p>'
        : `<p class="heart-section__note">Fehlende Runtime-Abhaengigkeit: ${escapeHtml(missingDeps)}.</p>`}
    </article>
  `;
}

export function renderHeartCrmAdminReadView({ consumerDeps = {} } = {}) {
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
        ${CRM_READ_SECTIONS.map((section) => renderCrmReadSection(section, consumer)).join("")}
      </div>
    </div>
  `;
}
