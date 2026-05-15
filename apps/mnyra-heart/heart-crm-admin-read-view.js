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
  { key: "leads", title: "Leads", eyebrow: "CRM", icon: "list" },
  { key: "customers", title: "Kunden", eyebrow: "CRM", icon: "user" },
  { key: "staff", title: "Staff", eyebrow: "CEO", icon: "users" },
  { key: "businessAccounts", title: "Staff", eyebrow: "Business", icon: "chart" }
]);

const LEAD_STATUS_LABELS = Object.freeze({
  registered: "Registriert",
  contacted: "Kontaktiert",
  interested: "Interessiert",
  follow_up: "Follow-up",
  visit: "Besuch",
  offer: "Angebot",
  kunde: "Kunde",
  customer: "Kunde",
  no_interest: "Kein Interesse",
  archived: "Archiviert",
  active: "Aktiv",
  disabled: "Inaktiv"
});

const CUSTOMER_STATUS_LABELS = Object.freeze({
  kunde: "Kunde",
  customer: "Kunde",
  active: "Aktiv",
  registered: "Registriert",
  disabled: "Inaktiv",
  archived: "Archiviert"
});

const TYPE_LABELS = Object.freeze({
  cafe: "Cafe",
  restaurant: "Restaurant",
  bar: "Bar",
  bakery: "Bakery",
  shop: "Shop",
  hotel: "Hotel",
  other: "Other"
});

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

function normalizeHandle(value = "") {
  return asText(value)
    .replace(/^@/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    || "ceo";
}

function getInitials(name = "", fallback = "M") {
  const source = firstText(name, fallback);
  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || fallback;
}

function formatBooleanState(value) {
  if (value === true) return "Aktiv";
  if (value === false) return "Inaktiv";
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
    if (Number.isFinite(seconds) && seconds > 0) return formatDateLabel(new Date(seconds * 1000));
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

function labelFromMap(value = "", labels = {}) {
  const key = asText(value).toLowerCase();
  return labels[key] || asText(value);
}

function typeLabel(value = "") {
  return labelFromMap(value, TYPE_LABELS);
}

function statusTone(status = "") {
  const key = asText(status).toLowerCase();
  if (["active", "kunde", "customer", "success", "paid", "aktiv"].includes(key)) return "success";
  if (["archived", "disabled", "inactive", "no_interest", "inaktiv"].includes(key)) return "warning";
  if (["error", "failed", "rejected"].includes(key)) return "danger";
  return "info";
}

function renderChip(label = "", tone = "neutral", extraClass = "") {
  const safeLabel = asText(label);
  if (!safeLabel) return "";
  const safeTone = ["neutral", "info", "success", "warning", "danger", "dark"].includes(tone) ? tone : "neutral";
  return `<span class="heart-crm-chip heart-crm-chip--${safeTone} ${escapeHtml(extraClass)}">${escapeHtml(safeLabel)}</span>`;
}

function renderDisabledIconButton(iconName = "info", label = "Read-only") {
  return `
    <button type="button" class="heart-crm-icon-button" disabled aria-disabled="true" title="${escapeHtml(label)}">
      ${renderHeartIcon(iconName)}
    </button>
  `;
}

function renderAvatar({ imageUrl = "", label = "", size = "default" } = {}) {
  const safeImageUrl = asText(imageUrl);
  const safeLabel = firstText(label, "M");
  return `
    <div class="heart-crm-avatar heart-crm-avatar--${escapeHtml(size)}">
      ${safeImageUrl
        ? `<img src="${escapeHtml(safeImageUrl)}" alt="" loading="lazy" />`
        : `<span>${escapeHtml(getInitials(safeLabel))}</span>`}
    </div>
  `;
}

function renderScopeTabs(sectionKey = "", sectionState = {}, items = []) {
  const count = formatKnownCount(sectionState, items);
  const tabSets = {
    leads: [
      { key: "own", label: "Meine Leads", count, active: true },
      { key: "staff", label: "Staff Leads", count: "-", active: false },
      { key: "archived", label: "Archiviert", count: "-", active: false }
    ],
    customers: [
      { key: "own", label: "Meine Kunden", count, active: true },
      { key: "staff", label: "Staff Kunden", count: "-", active: false }
    ]
  };
  const tabs = tabSets[sectionKey] || [];
  if (!tabs.length) return "";
  return `
    <div class="heart-crm-scope-grid heart-crm-scope-grid--${escapeHtml(sectionKey)}">
      ${tabs.map((tab) => `
        <button type="button" class="heart-crm-scope-tab ${tab.active ? "heart-crm-scope-tab--active" : ""}" disabled aria-disabled="true">
          <span>${escapeHtml(tab.label)}</span>
          <strong>${escapeHtml(tab.count)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderSearchControl(sectionKey = "") {
  if (sectionKey !== "leads" && sectionKey !== "customers") return "";
  const placeholder = sectionKey === "leads" ? "Lead suchen..." : "Kunde suchen...";
  return `
    <div class="heart-crm-control-row">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("list")}</span>
      <input type="text" value="" placeholder="${escapeHtml(placeholder)}" disabled aria-disabled="true" />
      <span class="heart-crm-readonly-label">Read-only</span>
    </div>
  `;
}

function renderLeadStatusFilter() {
  return `
    <div class="heart-crm-control-row heart-crm-control-row--select">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("list")}</span>
      <select disabled aria-disabled="true">
        <option>Alle Status</option>
        <option>Registriert</option>
        <option>Kontaktiert</option>
        <option>Interessiert</option>
        <option>Angebot</option>
      </select>
      <span class="heart-crm-control-row__icon">${renderHeartIcon("chevronDown")}</span>
    </div>
  `;
}

function formatAccessLabel(item = {}) {
  const access = [];
  if (item.businessAccess === true) access.push("Business");
  if (item.waiterAccess === true) access.push("Kellner");
  return access.join(" + ");
}

function renderOwnershipPills(item = {}) {
  const creatorName = firstText(item.createdByName, item.creatorName, item.ceoRootName, item.ownerName);
  const creatorHandle = firstText(item.createdByHandle, item.ownerHandle);
  if (!creatorName && !creatorHandle && !firstText(item.createdByUid, item.ceoRootUid)) return "";
  return `
    <div class="heart-crm-chip-row">
      ${renderChip("Staff", "neutral")}
      ${renderChip(firstText(creatorName, creatorHandle), "info")}
    </div>
  `;
}

function renderActionRow(actions = []) {
  const visibleActions = actions.filter((action) => asText(action?.label));
  if (!visibleActions.length) return "";
  return `
    <div class="heart-crm-action-row">
      ${visibleActions.map((action) => `
        <button type="button" class="heart-crm-action-placeholder ${action.primary ? "heart-crm-action-placeholder--primary" : ""}" disabled aria-disabled="true">
          ${escapeHtml(action.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderExtraMetaChips(items = []) {
  const chips = items
    .map((item) => renderChip(item.label, item.tone || "neutral"))
    .filter(Boolean)
    .join("");
  return chips ? `<div class="heart-crm-chip-row">${chips}</div>` : "";
}

function renderLeadCard(lead = {}) {
  const logoUrl = firstText(lead.logoUrl, lead.logo, lead.imageUrl, lead.bestSpotLogoUrl);
  const businessName = firstText(lead.businessName, lead.restaurantName, lead.name, "Business");
  const emailLine = firstText(lead.email, lead.socialEmail);
  const statusValue = firstText(lead.status, "registered");
  const statusLabel = labelFromMap(statusValue, LEAD_STATUS_LABELS);
  const leadType = typeLabel(firstText(lead.customerType, lead.type, lead.category));
  const location = firstText(lead.city, lead.address, lead.country);
  const plusCode = firstText(lead.plusCode, lead.googlePlusCode, lead.olc);
  const geo = [lead.lat ?? lead.gpsLat, lead.lng ?? lead.gpsLng]
    .map((value) => asText(value))
    .filter(Boolean)
    .join(", ");
  const hasProfilePlaceholder = !!firstText(lead.landingRestaurantId, lead.restaurantId, lead.publicSlug, lead.landingSlug, lead.canonicalPublicPath);
  return `
    <article class="heart-crm-card">
      <div class="heart-crm-card-head">
        ${renderAvatar({ imageUrl: logoUrl, label: businessName })}
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(businessName)}</p>
          ${emailLine ? `<p class="heart-crm-card-meta">${escapeHtml(emailLine)}</p>` : ""}
        </div>
        ${renderChip(statusLabel, statusTone(statusValue), "heart-crm-status-pill")}
      </div>
      ${renderOwnershipPills(lead)}
      ${renderExtraMetaChips([
        { label: leadType },
        { label: location },
        { label: plusCode ? `PlusCode ${plusCode}` : "" },
        { label: geo ? `GPS ${geo}` : "" },
        { label: firstText(lead.contactName, lead.contact), tone: "info" },
        { label: firstText(lead.phone), tone: "info" },
        { label: firstText(lead.restaurantId), tone: "neutral" },
        { label: formatDateLabel(firstText(lead.createdAt, lead.created)), tone: "neutral" }
      ])}
      ${renderActionRow([
        { label: hasProfilePlaceholder ? "Profil" : "" },
        { label: "Bearbeiten", primary: true }
      ])}
    </article>
  `;
}

function renderCustomerCard(rest = {}) {
  const logoUrl = firstText(rest.logoUrl, rest.logo, rest.imageUrl);
  const name = firstText(rest.name, rest.restaurantName, rest.businessName, "Business");
  const type = typeLabel(firstText(rest.type, rest.customerType));
  const city = firstText(rest.city, rest.address, rest.country);
  const statusValue = firstText(rest.status, "kunde");
  const statusLabel = labelFromMap(statusValue, CUSTOMER_STATUS_LABELS);
  return `
    <article class="heart-crm-card">
      <div class="heart-crm-card-head">
        ${renderAvatar({ imageUrl: logoUrl, label: name })}
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(name)}</p>
          <p class="heart-crm-card-meta">${escapeHtml([type, city].filter(Boolean).join(" / "))}</p>
        </div>
        ${renderChip(statusLabel, statusTone(statusValue), "heart-crm-status-pill")}
      </div>
      ${renderOwnershipPills(rest)}
      ${renderExtraMetaChips([
        { label: firstText(rest.ownerEmail, rest.email, rest.socialEmail), tone: "info" },
        { label: firstText(rest.phone), tone: "info" },
        { label: firstText(rest.billingStatus, rest.subscriptionStatus), tone: "neutral" },
        { label: firstText(rest.restaurantId, rest.id), tone: "neutral" },
        { label: formatDateLabel(firstText(rest.createdAt, rest.created)), tone: "neutral" }
      ])}
      ${renderActionRow([{ label: "Bearbeiten", primary: true }])}
    </article>
  `;
}

function renderStaffCard(entry = {}, crmAdmin = {}) {
  const name = firstText(entry.name, entry.displayName, entry.email, "CEO");
  const email = firstText(entry.email);
  const handle = firstText(entry.handle, normalizeHandle(name));
  const currentUid = asText(crmAdmin?.currentUid || "");
  const isSelf = currentUid && asText(entry.uid) === currentUid;
  const relation = firstText(entry.relation, isSelf ? "Du" : (entry.ceoParentUid ? "Unterstaff" : "Direkt"));
  const storedCounts = entry.crmCounts && typeof entry.crmCounts === "object" ? entry.crmCounts : {};
  const leadCount = Number.isFinite(Number(storedCounts.ownLeads)) ? Number(storedCounts.ownLeads) : 0;
  const customerCount = Number.isFinite(Number(storedCounts.ownCustomers)) ? Number(storedCounts.ownCustomers) : 0;
  const locationText = firstText(entry.locationLabel, entry.location, entry.city, entry.country, "-");
  const avatarUrl = firstText(entry.avatarPreview, entry.avatarUrl, entry.avatar, entry.photoURL);
  return `
    <article class="heart-crm-card heart-crm-card--staff">
      <div class="heart-crm-card-head">
        ${renderAvatar({ imageUrl: avatarUrl, label: name, size: "large" })}
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(name)}</p>
          <p class="heart-crm-card-meta">@${escapeHtml(handle)}</p>
          ${email ? `<p class="heart-crm-card-subline">${escapeHtml(email)}</p>` : ""}
        </div>
        ${renderChip(relation, isSelf ? "dark" : "info", "heart-crm-status-pill")}
      </div>
      ${renderExtraMetaChips([
        { label: firstText(entry.country, "-") },
        { label: locationText },
        { label: firstText(entry.role, entry.staffRole), tone: "info" },
        { label: firstText(entry.restaurantId, entry.staffRestaurantId, entry.assignedRestaurantId), tone: "neutral" }
      ])}
      <div class="heart-crm-stats-grid">
        <div class="heart-crm-stat-box">
          <span>Leads</span>
          <strong>${escapeHtml(String(leadCount))}</strong>
        </div>
        <div class="heart-crm-stat-box">
          <span>Kunden</span>
          <strong>${escapeHtml(String(customerCount))}</strong>
        </div>
      </div>
      <div class="heart-crm-card-footer">
        <span>Bearbeiten deaktiviert (read-only)</span>
        <span class="heart-crm-footer-icon">${renderHeartIcon("info")}</span>
      </div>
    </article>
  `;
}

function renderBusinessAccountCard(entry = {}) {
  const accessLabel = formatAccessLabel(entry) || "Kellner";
  const activeLabel = hasOwnValue(entry, "active") ? formatBooleanState(entry.active) : firstText(entry.status);
  const accountName = firstText(entry.name, [entry.firstName, entry.lastName].filter(Boolean).join(" "), entry.email, "Staff");
  const roleLabel = asText(entry.role).toLowerCase() === "manager" ? "Manager" : "Kellner";
  return `
    <article class="heart-crm-card heart-crm-card--business-account">
      <div class="heart-crm-card-head">
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(accountName)}</p>
          <p class="heart-crm-card-meta">${escapeHtml(firstText(entry.email, entry.userEmail))}</p>
        </div>
        ${renderChip(firstText(activeLabel, "Aktiv"), statusTone(activeLabel), "heart-crm-status-pill")}
      </div>
      <div class="heart-crm-chip-row">
        ${renderChip(roleLabel, "neutral")}
        ${renderChip(accessLabel, "info")}
        ${renderChip(firstText(entry.restaurantName, entry.businessName, entry.restaurantId), "neutral")}
        ${renderChip(firstText(entry.uid, entry.userId), "neutral")}
      </div>
      <div class="heart-crm-card-footer">
        <span>Bearbeiten deaktiviert (read-only)</span>
        <span class="heart-crm-footer-icon">${renderHeartIcon("info")}</span>
      </div>
    </article>
  `;
}

function renderStaffBuildStatusPanel(crmAdmin = {}) {
  const buildStatus = crmAdmin?.buildStatus && typeof crmAdmin.buildStatus === "object"
    ? crmAdmin.buildStatus
    : {};
  return `
    <div class="heart-crm-build-panel">
      <p>Build Status</p>
      <div class="heart-crm-build-grid">
        <span>Commit</span>
        <strong>${escapeHtml(firstText(buildStatus.commitShort, "unbekannt"))}</strong>
        <span>Build</span>
        <strong>${escapeHtml(firstText(formatDateLabel(buildStatus.buildTimestamp), "unbekannt"))}</strong>
        <span>Branch</span>
        <strong>${escapeHtml(firstText(buildStatus.branch, "unbekannt"))}</strong>
        <span>Env</span>
        <strong>${escapeHtml(firstText(buildStatus.environment, "unbekannt"))}</strong>
      </div>
    </div>
  `;
}

function getSectionStatusLabel(sectionState = {}, ready = false) {
  const status = asText(sectionState?.status);
  if (!ready) return "Deps pending";
  if (status === "loading") return "Loading";
  if (status === "error") return "Error";
  if (status === "missing") return "Deps pending";
  if (asText(sectionState?.missingContext)) return "Context missing";
  return "Read-only";
}

function getSectionBadgeTone(sectionState = {}, ready = false) {
  const status = asText(sectionState?.status);
  if (!ready || status === "missing") return "warning";
  if (asText(sectionState?.missingContext)) return "warning";
  if (status === "error") return "danger";
  return "info";
}

function renderStateBlock(label = "", tone = "neutral") {
  return `<div class="heart-crm-state heart-crm-state--${escapeHtml(tone)}">${escapeHtml(label)}</div>`;
}

function renderSectionList(sectionKey = "", section = {}, sectionState = {}, crmAdmin = {}) {
  const items = Array.isArray(sectionState.items) ? sectionState.items : [];
  const status = asText(sectionState.status);
  const missingContextLabel = getMissingContextLabel(sectionState.missingContext || "");
  if (missingContextLabel) return renderStateBlock(missingContextLabel, "warning");
  if (status === "loading") return renderStateBlock(`${section.title} laden...`, "neutral");
  if (status === "error") return renderStateBlock(sectionState.error || "Read-only Abruf fehlgeschlagen.", "danger");
  if (!items.length) {
    const emptyLabels = {
      leads: "Keine Leads",
      customers: "Keine Kunden",
      staff: "Noch kein CEO Staff",
      businessAccounts: "Noch kein Staff vorhanden"
    };
    return renderStateBlock(emptyLabels[sectionKey] || "Keine Eintraege", "neutral");
  }
  const renderers = {
    leads: (item) => renderLeadCard(item),
    customers: (item) => renderCustomerCard(item),
    staff: (item) => renderStaffCard(item, crmAdmin),
    businessAccounts: (item) => renderBusinessAccountCard(item)
  };
  const rows = items.slice(0, 20).map((item) => renderers[sectionKey]?.(item) || "").join("");
  const hiddenCount = Math.max(0, items.length - 20);
  return `
    <div class="heart-crm-list-stack">
      ${rows}
      ${hiddenCount ? renderStateBlock(`${hiddenCount} weitere Eintraege sind im Count enthalten.`, "neutral") : ""}
    </div>
  `;
}

function renderSectionTools(sectionKey = "", sectionState = {}, items = []) {
  return `
    ${renderScopeTabs(sectionKey, sectionState, items)}
    ${renderSearchControl(sectionKey)}
    ${sectionKey === "leads" ? renderLeadStatusFilter() : ""}
  `;
}

function renderSectionHeaderActions(sectionKey = "") {
  if (sectionKey === "leads") {
    return `
      <div class="heart-crm-header-actions">
        ${renderDisabledIconButton("settings", "Read-only settings")}
        ${renderDisabledIconButton("plus", "Read-only new lead")}
      </div>
    `;
  }
  if (sectionKey === "staff" || sectionKey === "businessAccounts") {
    return `
      <div class="heart-crm-header-actions">
        ${renderDisabledIconButton("plus", "Read-only new entry")}
      </div>
    `;
  }
  return "";
}

function renderCrmReadSection(section, consumer, crmAdmin = {}) {
  const domain = consumer?.[section.key] || null;
  const ready = typeof domain?.load === "function" && domain.ready === true;
  const sectionState = crmAdmin?.sections?.[section.key] || {};
  const items = Array.isArray(sectionState.items) ? sectionState.items : [];
  const sectionStatus = asText(sectionState.status);
  const missingDeps = Array.isArray(domain?.missingDeps) && domain.missingDeps.length
    ? domain.missingDeps.join(", ")
    : formatMissingDeps(section.key);
  const canShowList = ready && (sectionStatus === "ready" || sectionStatus === "loading" || sectionStatus === "error");

  return `
    <section id="${escapeHtml(section.key)}View" class="heart-crm-social-view heart-crm-social-view--${escapeHtml(section.key)}">
      <div class="heart-crm-social-head">
        <div>
          <span class="heart-crm-social-eyebrow">${escapeHtml(section.eyebrow)}</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        ${renderSectionHeaderActions(section.key)}
      </div>
      ${renderSectionTools(section.key, sectionState, items)}
      ${section.key === "staff" ? renderStaffBuildStatusPanel(crmAdmin) : ""}
      ${ready ? "" : renderStateBlock(`Read loader fehlt: ${missingDeps}.`, "warning")}
      ${ready && !canShowList ? renderStateBlock("Noch kein read-only Abruf in dieser Session.", "neutral") : ""}
      ${canShowList ? renderSectionList(section.key, section, sectionState, crmAdmin) : ""}
      ${sectionState.hasMore ? renderStateBlock(sectionState.loadingMore ? "Laedt..." : "Scrollt weiter...", "neutral") : ""}
      <div class="heart-crm-section-foot">
        ${renderBadge(getSectionStatusLabel(sectionState, ready), getSectionBadgeTone(sectionState, ready))}
        <span>Count ${escapeHtml(ready && sectionStatus === "ready" ? formatKnownCount(sectionState, items) : "Nicht geladen")}</span>
      </div>
    </section>
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

  return `
    <div class="heart-crm-admin-read-shell">
      <section class="heart-crm-contract-strip">
        <div>
          <p class="heart-crm-social-eyebrow">CRM/Admin</p>
          <strong>Read-only Verbindung</strong>
          <span>${readLoadersReady
            ? "Die read-only Loader sind verbunden."
            : `Live-Daten bleiben aus, bis diese Loader bereitstehen: ${escapeHtml(missingReadDeps.join(", "))}.`}</span>
        </div>
        ${renderBadge(mode, "info")}
      </section>
      ${error ? `<div class="heart-error-block">${escapeHtml(error)}</div>` : ""}
      ${CRM_READ_SECTIONS.map((section) => renderCrmReadSection(section, consumer, crmAdmin || {})).join("")}
    </div>
  `;
}
