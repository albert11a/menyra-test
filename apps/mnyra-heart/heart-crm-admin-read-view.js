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
  {
    key: "leads",
    title: "Leads",
    eyebrow: "CRM",
    icon: "list",
    emptyLabel: "Keine Leads im aktuellen read-only Abruf.",
    summary: "Pipeline, Kontakt, Ort und Zustandsdaten aus dem bestehenden CRM Read-Model."
  },
  {
    key: "customers",
    title: "Customers",
    eyebrow: "CRM",
    icon: "user",
    emptyLabel: "Keine Customers im aktuellen read-only Abruf.",
    summary: "Kundenprofil, Kontakt, Typ und Status aus dem bestehenden CRM Read-Model."
  },
  {
    key: "staff",
    title: "Staff",
    eyebrow: "Team",
    icon: "users",
    emptyLabel: "Kein Staff im aktuellen read-only Abruf.",
    summary: "Teamdaten, Rolle und Zuordnung aus dem bestehenden Staff Read-Model."
  },
  {
    key: "businessAccounts",
    title: "Business Accounts",
    eyebrow: "Business",
    icon: "chart",
    emptyLabel: "Keine Business Accounts im aktuellen read-only Abruf.",
    summary: "Account, Zugriff und Restaurant-Kontext aus dem bestehenden Business Account Read-Model."
  }
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

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return "";
}

function hasOwnValue(record = {}, key = "") {
  return Object.prototype.hasOwnProperty.call(record || {}, key);
}

function formatBooleanState(value) {
  if (value === true) return "Active";
  if (value === false) return "Inactive";
  return "";
}

function formatDateLabel(value = "") {
  if (value instanceof Date) {
    return value.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  }
  if (value && typeof value.toDate === "function") {
    return formatDateLabel(value.toDate());
  }
  if (value && typeof value === "object") {
    const seconds = Number(value.seconds ?? value._seconds ?? 0);
    if (Number.isFinite(seconds) && seconds > 0) {
      return formatDateLabel(new Date(seconds * 1000));
    }
  }
  const raw = asText(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function getSectionStatusLabel(sectionState = {}, ready = false) {
  const status = String(sectionState?.status || "").trim();
  if (!ready) return "Deps pending";
  if (status === "loading") return "Loading";
  if (status === "error") return "Error";
  if (status === "missing") return "Deps pending";
  if (asText(sectionState?.missingContext)) return "Context missing";
  return "Read-only";
}

function getSectionBadgeTone(sectionState = {}, ready = false) {
  const status = String(sectionState?.status || "").trim();
  if (!ready || status === "missing") return "warning";
  if (asText(sectionState?.missingContext)) return "warning";
  if (status === "error") return "danger";
  return "info";
}

function formatKnownCount(sectionState = {}, items = []) {
  const fallbackCount = Array.isArray(items) ? items.length : 0;
  const knownCount = Number(sectionState?.knownCount);
  const resolvedCount = Number.isFinite(knownCount) ? knownCount : fallbackCount;
  return `${resolvedCount}${sectionState?.countExact === false ? "+" : ""}`;
}

function getMissingContextLabel(value = "") {
  const context = asText(value);
  if (!context) return "";
  return `${context} missing`;
}

function renderInlineBadges(values = []) {
  return values
    .filter((entry) => asText(entry?.label))
    .map((entry) => renderBadge(entry.label, entry.tone || "neutral"))
    .join("");
}

function renderReadOnlyField(label = "", value = "") {
  const safeLabel = asText(label);
  const safeValue = asText(value);
  if (!safeLabel || !safeValue) return "";
  return `
    <div>
      <span>${escapeHtml(safeLabel)}</span>
      <strong>${escapeHtml(safeValue)}</strong>
    </div>
  `;
}

function renderReadOnlyFields(fields = []) {
  const html = fields
    .map((field) => renderReadOnlyField(field.label, field.value))
    .filter(Boolean)
    .join("");
  if (!html) return "";
  return `
    <div class="heart-detail-grid">
      ${html}
    </div>
  `;
}

function normalizeStatusTone(status = "") {
  const key = asText(status).toLowerCase();
  if (["active", "ready", "customer", "paid", "success"].includes(key)) return "success";
  if (["inactive", "archived", "paused", "blocked", "lost"].includes(key)) return "warning";
  if (["error", "failed", "rejected"].includes(key)) return "danger";
  return "info";
}

function formatAccessLabel(item = {}) {
  const access = [];
  if (item.businessAccess === true) access.push("Business");
  if (item.waiterAccess === true) access.push("Waiter");
  return access.join(" + ");
}

function resolveLeadDescriptor(item = {}) {
  const location = firstText(item.address, item.city, item.country);
  const plusCode = firstText(item.plusCode, item.googlePlusCode, item.olc);
  const contact = firstText(item.phone, item.instagram, item.email, item.socialEmail);
  return {
    eyebrow: firstText(item.status, "Lead"),
    title: firstText(item.businessName, item.restaurantName, item.name, item.email, item.id, "Lead"),
    subtitle: firstText(contact, location, plusCode, item.restaurantId),
    badges: [
      { label: firstText(item.status), tone: normalizeStatusTone(item.status) },
      { label: firstText(item.type, item.customerType, item.category), tone: "neutral" }
    ],
    fields: [
      { label: "Contact", value: contact },
      { label: "Email", value: firstText(item.email, item.socialEmail) },
      { label: "Phone", value: firstText(item.phone) },
      { label: "Instagram", value: firstText(item.instagram) },
      { label: "Address", value: location },
      { label: "PlusCode", value: plusCode },
      { label: "Assigned", value: firstText(item.assignedStaffName, item.assignedToName, item.ownerName, item.createdByName, item.ceoName, item.createdBy) },
      { label: "Restaurant", value: firstText(item.restaurantId, item.landingRestaurantId) },
      { label: "Created", value: formatDateLabel(firstText(item.createdAt, item.created)) }
    ]
  };
}

function resolveCustomerDescriptor(item = {}) {
  const title = firstText(item.name, item.businessName, item.restaurantName, item.ownerEmail, item.email, item.id, "Customer");
  const contactEmail = firstText(item.email, item.ownerEmail, item.socialEmail);
  return {
    eyebrow: firstText(item.status, item.type, "Customer"),
    title,
    subtitle: firstText(contactEmail, item.phone, item.restaurantId, item.id),
    badges: [
      { label: firstText(item.status), tone: normalizeStatusTone(item.status) },
      { label: firstText(item.type, item.customerType, item.category), tone: "neutral" }
    ],
    fields: [
      { label: "Type", value: firstText(item.type, item.customerType, item.category) },
      { label: "Email", value: contactEmail },
      { label: "Phone", value: firstText(item.phone) },
      { label: "Restaurant", value: firstText(item.restaurantId) },
      { label: "Customer ID", value: firstText(item.customerId, item.id) },
      { label: "Created", value: formatDateLabel(firstText(item.createdAt, item.created)) }
    ]
  };
}

function resolveStaffDescriptor(item = {}) {
  const activeLabel = hasOwnValue(item, "active") ? formatBooleanState(item.active) : "";
  const status = firstText(item.status, activeLabel);
  return {
    eyebrow: firstText(item.role, item.country, "Staff"),
    title: firstText(item.name, item.displayName, item.email, item.uid, "Staff"),
    subtitle: firstText(item.email, item.country, item.restaurantId, item.uid),
    badges: [
      { label: firstText(item.role), tone: "neutral" },
      { label: status, tone: normalizeStatusTone(status) }
    ],
    fields: [
      { label: "Email", value: firstText(item.email) },
      { label: "Role", value: firstText(item.role) },
      { label: "Restaurant", value: firstText(item.restaurantName, item.businessName, item.restaurantId, item.assignedRestaurantId) },
      { label: "Country", value: firstText(item.country) },
      { label: "UID", value: firstText(item.uid, item.userId) },
      { label: "Created", value: formatDateLabel(firstText(item.createdAt, item.created)) }
    ]
  };
}

function resolveBusinessAccountDescriptor(item = {}) {
  const access = formatAccessLabel(item);
  const activeLabel = hasOwnValue(item, "active") ? formatBooleanState(item.active) : "";
  const status = firstText(item.status, activeLabel);
  const accountName = firstText(item.name, [item.firstName, item.lastName].filter(Boolean).join(" "), item.email, item.uid, "Business Account");
  return {
    eyebrow: firstText(item.role, access, "Account"),
    title: firstText(item.businessName, item.restaurantName, accountName),
    subtitle: firstText(item.email, item.userEmail, item.uid, item.restaurantId),
    badges: [
      { label: firstText(item.role), tone: "neutral" },
      { label: access, tone: "info" },
      { label: status, tone: normalizeStatusTone(status) }
    ],
    fields: [
      { label: "Account", value: accountName },
      { label: "Email", value: firstText(item.email, item.userEmail) },
      { label: "User", value: firstText(item.uid, item.userId) },
      { label: "Access", value: access },
      { label: "Restaurant", value: firstText(item.restaurantName, item.businessName, item.restaurantId) },
      { label: "Restaurant ID", value: firstText(item.restaurantId) },
      { label: "Created", value: formatDateLabel(firstText(item.createdAt, item.created)) }
    ]
  };
}

function resolveItemDescriptor(sectionKey = "", item = {}) {
  if (sectionKey === "leads") return resolveLeadDescriptor(item);
  if (sectionKey === "customers") return resolveCustomerDescriptor(item);
  if (sectionKey === "staff") return resolveStaffDescriptor(item);
  if (sectionKey === "businessAccounts") return resolveBusinessAccountDescriptor(item);
  return {
    eyebrow: "Read-only",
    title: firstText(item.name, item.id, "-"),
    subtitle: firstText(item.email, item.status),
    badges: [{ label: firstText(item.status), tone: normalizeStatusTone(item.status) }],
    fields: []
  };
}

function renderReadOnlyItem(sectionKey = "", item = {}) {
  const descriptor = resolveItemDescriptor(sectionKey, item);
  return `
    <article class="heart-dashboard-metric" aria-label="${escapeHtml(descriptor.title)}">
      <div class="heart-dashboard-metric__top">
        <div>
          <p class="heart-eyebrow">${escapeHtml(descriptor.eyebrow || "Read-only")}</p>
          <strong>${escapeHtml(descriptor.title)}</strong>
          ${descriptor.subtitle ? `<p>${escapeHtml(descriptor.subtitle)}</p>` : ""}
        </div>
        <span class="heart-dashboard-metric__icon">${renderHeartIcon("info")}</span>
      </div>
      <div class="heart-meta-row">
        ${renderInlineBadges(descriptor.badges)}
      </div>
      ${renderReadOnlyFields(descriptor.fields)}
    </article>
  `;
}

function renderSectionItems(section = {}, items = []) {
  const list = Array.isArray(items) ? items.slice(0, 8) : [];
  if (!list.length) return `<p class="heart-section__note">${escapeHtml(section.emptyLabel || "Keine Eintraege im aktuellen read-only Abruf.")}</p>`;
  const hiddenCount = Math.max(0, (Array.isArray(items) ? items.length : 0) - list.length);
  return `
    <div class="heart-view-stack">
      ${list.map((item) => renderReadOnlyItem(section.key, item)).join("")}
      ${hiddenCount ? `<p class="heart-section__note">${escapeHtml(`${hiddenCount} weitere Eintraege sind im Count enthalten.`)}</p>` : ""}
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
  const missingContextLabel = getMissingContextLabel(missingContext);
  const note = !ready
    ? `Read loader fehlt: ${missingDeps}.`
    : sectionStatus === "loading"
      ? "Read-only Datenabruf laeuft."
      : sectionStatus === "error"
        ? (sectionState.error || "Read-only Datenabruf fehlgeschlagen.")
        : missingContextLabel
          ? `Runtime context: ${missingContextLabel}.`
          : section.summary;
  const countLabel = ready && sectionStatus === "ready"
    ? formatKnownCount(sectionState, items)
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
        <p class="heart-eyebrow">${escapeHtml(section.eyebrow || "CRM")}</p>
        <strong>${escapeHtml(section.title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="heart-meta-row">
        <span>Count</span>
        <strong>${escapeHtml(countLabel)}</strong>
      </div>
      ${ready && sectionStatus === "ready" && missingContextLabel
        ? `<div class="heart-loading-block">${escapeHtml(missingContextLabel)}</div>`
        : ready && sectionStatus === "ready"
          ? renderSectionItems(section, items)
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
