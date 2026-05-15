import {
  HEART_CRM_ADMIN_CONSUMER_MODE,
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
  leads: Object.freeze(["loadLeads"]),
  customers: Object.freeze(["loadCustomers"]),
  staff: Object.freeze(["loadCeoStaff"]),
  businessAccounts: Object.freeze(["loadBusinessAccounts"])
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
  const canLoad = typeof domain?.load === "function";
  const missingDeps = formatMissingDeps(section.key);
  const note = canLoad
    ? `Consumer verbunden. Runtime-Abhaengigkeit fehlt noch: ${missingDeps}.`
    : "Consumer-Domain ist noch nicht verfuegbar.";

  return `
    <article class="heart-dashboard-metric">
      <div class="heart-dashboard-metric__top">
        <span class="heart-dashboard-metric__icon">${renderHeartIcon(section.icon)}</span>
        ${renderBadge(canLoad ? "Read-only" : "Fehlt", canLoad ? "info" : "warning")}
      </div>
      <div class="heart-dashboard-metric__body">
        <strong>${escapeHtml(section.title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="heart-meta-row">
        <span>Count</span>
        <strong>Nicht geladen</strong>
      </div>
      <p class="heart-section__note">Liste: Runtime-Abhaengigkeiten aus Social CRM stehen Heart noch nicht bereit.</p>
    </article>
  `;
}

export function renderHeartCrmAdminReadView({ consumerDeps = {} } = {}) {
  const {
    consumer,
    error
  } = createReadConsumer(consumerDeps);
  const mode = consumer?.mode || HEART_CRM_ADMIN_CONSUMER_MODE;

  // READ-ONLY future Heart/Admin migration seam. Real loads stay dependency-pending here.
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
          Heart kann den CRM/Admin Consumer importieren. Live-Daten bleiben aus, bis die bestehenden Social-CRM Load-Abhaengigkeiten explizit an Heart uebergeben werden.
        </p>
        ${error ? `<div class="heart-error-block">${escapeHtml(error)}</div>` : ""}
      </section>
      <div class="heart-dashboard-metrics">
        ${CRM_READ_SECTIONS.map((section) => renderCrmReadSection(section, consumer)).join("")}
      </div>
    </div>
  `;
}
