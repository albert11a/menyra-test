import {
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
import {
  CEO_COUNTRIES,
  LEAD_SETTINGS_DEFAULT_COUNTRY,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  LEAD_TYPE_LABELS,
  LEAD_TYPE_ORDER
} from "../menyra-social/core/app-shell/social-app-domain-config.js";
import {
  hasStoredCeoCrmCountsCore,
  resolveKnownScopeCountLabelCore,
  sanitizeCeoCrmCountsCore
} from "../menyra-social/core/crm/ceo-staff-sync-utils.js";
import {
  normalizeLeadCountryCore
} from "../menyra-social/core/leads/lead-country-utils.js";
import {
  normalizeLeadPricingCore
} from "../menyra-social/core/leads/lead-pricing-utils.js";
import {
  normalizeLeadSettingsCore
} from "../menyra-social/core/leads/lead-settings-utils.js";
import {
  normalizeLeadStatusKeyCore
} from "../menyra-social/core/leads/lead-taxonomy-utils.js";
import {
  normalizeLeadTypeKeyCore
} from "../menyra-social/core/leads/lead-type-utils.js";

export const HEART_CRM_ADMIN_READ_VIEW_MISSING_DEPS = Object.freeze({
  leads: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.leads]),
  customers: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.customers]),
  staff: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.staff]),
  businessAccounts: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.businessAccounts])
});

export const HEART_CRM_ADMIN_WRITE_VIEW_MISSING_DEPS = Object.freeze({
  leads: Object.freeze([]),
  customers: Object.freeze([]),
  staff: Object.freeze([])
});

const CRM_READ_SECTIONS = Object.freeze([
  { key: "leads", title: "Leads", eyebrow: "CRM", icon: "list" },
  { key: "customers", title: "Kunden", eyebrow: "CRM", icon: "user" },
  { key: "staff", title: "Staff", eyebrow: "CEO", icon: "users" }
]);
const CRM_READ_SECTION_BY_KEY = Object.freeze(
  CRM_READ_SECTIONS.reduce((map, section) => ({
    ...map,
    [section.key]: section
  }), {})
);
const CUSTOMER_DELETE_DISABLED_REASON = "Kein sicherer Customer-delete Facade vorhanden; Social CRM Migration Adapter exponiert Customer delete/remove ausdruecklich nicht.";

const CUSTOMER_STATUS_LABELS = Object.freeze({
  kunde: "Kunde",
  customer: "Kunde",
  active: "Aktiv",
  registered: "Registriert",
  contacted: "Kontaktiert",
  testphase: "Testphase",
  no_interest: "Kein Interesse",
  disabled: "Inaktiv",
  archived: "Archiviert"
});

function formatMissingDeps(domainKey = "") {
  return (HEART_CRM_ADMIN_READ_VIEW_MISSING_DEPS[domainKey] || []).join(", ");
}

function normalizeHeartLeadCountry(value = "") {
  return normalizeLeadCountryCore(value, {
    allowedCountries: CEO_COUNTRIES,
    fallbackCountry: LEAD_SETTINGS_DEFAULT_COUNTRY
  });
}

function normalizeHeartLeadStatus(value = "", fallback = "registered") {
  const normalized = normalizeLeadStatusKeyCore(value || fallback);
  return LEAD_STATUS_ORDER.includes(normalized) ? normalized : fallback;
}

function normalizeHeartLeadSettings(raw = {}) {
  return normalizeLeadSettingsCore(raw, {
    defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
    normalizeLeadCountryFn: normalizeHeartLeadCountry,
    normalizeLeadPricingFn: (pricing) => normalizeLeadPricingCore(pricing, {
      leadTypeOrder: LEAD_TYPE_ORDER
    })
  });
}

function resolveLeadSettingsConfig(crmAdmin = {}, modal = {}) {
  const draft = modal?.draft && typeof modal.draft === "object" ? modal.draft : {};
  const draftSettings = draft.leadSettings && typeof draft.leadSettings === "object" ? draft.leadSettings : null;
  const profileSettings = crmAdmin?.userProfile?.leadSettings && typeof crmAdmin.userProfile.leadSettings === "object"
    ? crmAdmin.userProfile.leadSettings
    : {};
  return normalizeHeartLeadSettings(draftSettings || profileSettings);
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
  return resolveKnownScopeCountLabelCore(
    Number.isFinite(knownCount) ? knownCount : fallbackCount,
    sectionState?.countExact !== false,
    true
  );
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

function normalizeHeartLeadType(value = "") {
  const normalized = normalizeLeadTypeKeyCore(value);
  return LEAD_TYPE_ORDER.includes(normalized) ? normalized : "";
}

function typeLabel(value = "") {
  const normalized = normalizeHeartLeadType(value);
  return normalized ? LEAD_TYPE_LABELS[normalized] : labelFromMap(value, LEAD_TYPE_LABELS);
}

function normalizeSearchKey(value = "") {
  return asText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchTokens(query = "") {
  return normalizeSearchKey(query).split(" ").filter(Boolean);
}

function itemMatchesQuery(item = {}, query = "") {
  const queryTokens = getSearchTokens(query);
  if (!queryTokens.length) return true;
  const typeValue = firstText(item.customerType, item.type, item.category, item.leadType);
  const statusValue = firstText(item.status);
  const haystack = normalizeSearchKey([
    item.businessName,
    item.restaurantName,
    item.name,
    item.displayName,
    item.email,
    item.socialEmail,
    item.ownerEmail,
    item.phone,
    item.instagram,
    item.city,
    item.country,
    statusValue,
    labelFromMap(statusValue, LEAD_STATUS_LABELS),
    typeValue,
    typeLabel(typeValue),
    item.handle
  ].filter(Boolean).join(" "));
  const compactHaystack = haystack.replace(/\s+/g, "");
  return queryTokens.every((token) => haystack.includes(token) || compactHaystack.includes(token));
}

function itemMatchesLeadCategory(item = {}, categoryFilter = "") {
  const filterKey = normalizeHeartLeadType(categoryFilter);
  if (!filterKey) return true;
  const itemTypeKey = normalizeHeartLeadType(firstText(item.customerType, item.type, item.category, item.leadType));
  return itemTypeKey === filterKey;
}

function statusTone(status = "") {
  const key = asText(status).toLowerCase();
  if (["active", "kunde", "customer", "success", "paid", "aktiv"].includes(key)) return "success";
  if (["contacted", "testphase"].includes(key)) return "info";
  if (["archived", "disabled", "inactive", "no_interest", "inaktiv"].includes(key)) return "warning";
  if (["error", "failed", "rejected", "deleted"].includes(key)) return "danger";
  return "info";
}

function renderChip(label = "", tone = "neutral", extraClass = "") {
  const safeLabel = asText(label);
  if (!safeLabel) return "";
  const safeTone = ["neutral", "info", "success", "warning", "danger", "dark"].includes(tone) ? tone : "neutral";
  return `<span class="heart-crm-chip heart-crm-chip--${safeTone} ${escapeHtml(extraClass)}">${escapeHtml(safeLabel)}</span>`;
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

function renderOwnershipPills(item = {}, { hideOwn = false } = {}) {
  if (hideOwn) return "";
  const creatorName = firstText(item.createdByName, item.creatorName, item.ceoRootName, item.ownerName);
  const creatorHandle = firstText(item.createdByHandle, item.ownerHandle);
  const creatorUid = firstText(item.createdByUid, item.ceoRootUid, item.ownerUid);
  const label = firstText(creatorName, creatorHandle, creatorUid);
  if (!label) return "";
  return `
    <div class="heart-crm-chip-row">
      ${renderChip("Staff", "neutral")}
      ${renderChip(label, "info")}
    </div>
  `;
}

function renderCrmEditButton(domainKey = "", itemId = "", label = "Bearbeiten", extraClass = "") {
  const safeDomain = asText(domainKey);
  const safeId = asText(itemId);
  const socialAttr = safeDomain === "leads"
    ? `data-lead-edit="${escapeHtml(safeId)}"`
    : safeDomain === "customers"
      ? `data-customer-edit="${escapeHtml(safeId)}"`
      : "";
  return `
    <button type="button" class="heart-crm-action-placeholder ${escapeHtml(extraClass)}" data-action="open-crm-editor" data-crm-domain="${escapeHtml(safeDomain)}" data-crm-item-id="${escapeHtml(safeId)}" data-crm-mode="edit" ${socialAttr}>
      ${escapeHtml(label)}
    </button>
  `;
}

function renderDisabledCrmAction(label = "", missingDeps = [], iconName = "info", extraAttrs = "") {
  const deps = Array.isArray(missingDeps) ? missingDeps.filter(Boolean).join(", ") : asText(missingDeps);
  return `
    <button type="button" class="heart-crm-icon-button heart-crm-icon-button--disabled" ${extraAttrs} disabled aria-disabled="true" title="${escapeHtml(deps ? `Fehlt: ${deps}` : "Nicht verfuegbar")}">
      ${escapeHtml(label) ? `<span>${escapeHtml(label)}</span>` : renderHeartIcon(iconName)}
    </button>
  `;
}

function renderCrmHeaderAction({ label = "", iconName = "plus", domainKey = "", mode = "create", disabledReason = "", id = "" } = {}) {
  const reason = asText(disabledReason);
  if (reason) return renderDisabledCrmAction(label, reason, iconName);
  return `
    <button type="button" class="heart-crm-icon-button" ${id ? `id="${escapeHtml(id)}"` : ""} data-action="open-crm-editor" data-crm-domain="${escapeHtml(domainKey)}" data-crm-mode="${escapeHtml(mode)}" title="${escapeHtml(label || "Oeffnen")}">
      ${label ? `<span>${escapeHtml(label)}</span>` : renderHeartIcon(iconName)}
    </button>
  `;
}

function resolveLeadProfileUrl(lead = {}) {
  const directUrl = firstText(lead.landingPageUrl, lead.canonicalPublicPath);
  if (directUrl) return directUrl;
  const slug = firstText(lead.publicSlug, lead.landingSlug);
  if (!slug) return "";
  return `/${slug.replace(/^\/+/, "")}`;
}

function getStoredScopeCount(crmAdmin = {}, key = "") {
  const counts = crmAdmin?.userProfile?.crmCounts;
  if (!hasStoredCeoCrmCountsCore(counts)) return "";
  const sanitized = sanitizeCeoCrmCountsCore(counts);
  const value = sanitized[key];
  return Number.isFinite(Number(value)) ? String(Math.max(0, Number(value))) : "";
}

function renderScopeTabs(sectionKey = "", sectionState = {}, items = [], crmAdmin = {}) {
  const count = formatKnownCount(sectionState, items);
  const activeScope = firstText(sectionState.scope, "own");
  const scopeCounts = sectionState.scopeCounts && typeof sectionState.scopeCounts === "object" ? sectionState.scopeCounts : {};
  const scopeCountExact = sectionState.scopeCountExact && typeof sectionState.scopeCountExact === "object" ? sectionState.scopeCountExact : {};
  const scopeLoaded = sectionState.scopeLoaded && typeof sectionState.scopeLoaded === "object" ? sectionState.scopeLoaded : {};
  const resolveTabCount = (storedKey = "", scopeKey = "") => {
    const storedCount = getStoredScopeCount(crmAdmin, storedKey);
    if (storedCount !== "") return storedCount;
    if (activeScope === scopeKey) return count;
    const scopeCount = scopeCounts[scopeKey];
    if (Number.isFinite(Number(scopeCount))) {
      return resolveKnownScopeCountLabelCore(
        Math.max(0, Number(scopeCount)),
        scopeCountExact[scopeKey] !== false,
        scopeLoaded[scopeKey] === true
      );
    }
    return "-";
  };
  const tabSets = {
    leads: [
      { key: "own", label: "Meine Leads", count: resolveTabCount("ownLeads", "own") },
      { key: "staff", label: "Staff Leads", count: resolveTabCount("staffLeads", "staff") },
      { key: "archived", label: "Archiviert", count: resolveTabCount("archivedLeads", "archived") }
    ],
    customers: [
      { key: "own", label: "Meine Kunden", count: resolveTabCount("ownCustomers", "own") },
      { key: "staff", label: "Staff Kunden", count: resolveTabCount("staffCustomers", "staff") }
    ]
  };
  const tabs = tabSets[sectionKey] || [];
  if (!tabs.length) return "";
  return `
    <div class="heart-crm-scope-grid heart-crm-scope-grid--${escapeHtml(sectionKey)}">
      ${tabs.map((tab) => `
        <button type="button" class="heart-crm-scope-tab ${activeScope === tab.key ? "heart-crm-scope-tab--active" : ""}" data-action="set-crm-scope" data-crm-domain="${escapeHtml(sectionKey)}" data-crm-scope="${escapeHtml(tab.key)}" ${sectionKey === "leads" ? `data-lead-scope="${escapeHtml(tab.key)}"` : `data-customer-scope="${escapeHtml(tab.key)}"`}>
          <span>${escapeHtml(tab.label)}</span>
          <strong>${escapeHtml(tab.count)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderSearchControl(sectionKey = "", sectionState = {}) {
  if (sectionKey !== "leads" && sectionKey !== "customers") return "";
  const placeholder = sectionKey === "leads" ? "Lead suchen..." : "Kunde suchen...";
  const inputId = sectionKey === "leads" ? "leadsSearchInput" : "customersSearchInput";
  return `
    <div class="heart-crm-control-row">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("search")}</span>
      <input id="${escapeHtml(inputId)}" type="text" value="${escapeHtml(sectionState.query || "")}" placeholder="${escapeHtml(placeholder)}" data-crm-search data-crm-domain="${escapeHtml(sectionKey)}" />
    </div>
  `;
}

function renderLeadStatusFilter(sectionState = {}) {
  const statusFilter = asText(sectionState.statusFilter);
  return `
    <div class="heart-crm-control-row heart-crm-control-row--select">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("listFilter")}</span>
      <select id="leadsStatusFilter" data-crm-status data-crm-domain="leads">
        <option value="">Alle Status</option>
        ${LEAD_STATUS_ORDER
          .filter((key) => key !== "kunde" && key !== "no_interest")
          .map((key) => `<option value="${escapeHtml(key)}" ${statusFilter === key ? "selected" : ""}>${escapeHtml(LEAD_STATUS_LABELS[key] || key)}</option>`)
          .join("")}
      </select>
      <span class="heart-crm-control-row__icon">${renderHeartIcon("chevronDown")}</span>
    </div>
  `;
}

function renderLeadCategoryFilter(sectionState = {}) {
  const categoryFilter = normalizeHeartLeadType(sectionState.categoryFilter);
  return `
    <div class="heart-crm-control-row heart-crm-control-row--select">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("listFilter")}</span>
      <select id="leadsCategoryFilter" data-crm-category data-crm-domain="leads" aria-label="Kategorie">
        <option value="">Kategorie</option>
        ${LEAD_TYPE_ORDER
          .map((key) => `<option value="${escapeHtml(key)}" ${categoryFilter === key ? "selected" : ""}>${escapeHtml(LEAD_TYPE_LABELS[key] || key)}</option>`)
          .join("")}
      </select>
      <span class="heart-crm-control-row__icon">${renderHeartIcon("chevronDown")}</span>
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

function renderLeadCard(lead = {}, sectionState = {}) {
  const logoUrl = firstText(lead.logoUrl, lead.logo, lead.imageUrl, lead.bestSpotLogoUrl);
  const businessName = firstText(lead.businessName, lead.restaurantName, lead.name, "Business");
  const emailLine = firstText(lead.email, lead.socialEmail);
  const statusValue = firstText(lead.status, "registered");
  const statusLabel = labelFromMap(statusValue, LEAD_STATUS_LABELS);
  const profileUrl = resolveLeadProfileUrl(lead);
  const leadId = firstText(lead.id, lead.leadId);
  return `
    <article class="heart-crm-card heart-crm-card--lead">
      <div class="heart-crm-card-head">
        ${renderAvatar({ imageUrl: logoUrl, label: businessName })}
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(businessName)}</p>
          ${emailLine ? `<p class="heart-crm-card-meta">${escapeHtml(emailLine)}</p>` : ""}
        </div>
        ${renderChip(statusLabel, statusTone(statusValue), "heart-crm-status-pill")}
      </div>
      ${renderOwnershipPills(lead, { hideOwn: sectionState.scope === "own" })}
      <div class="heart-crm-action-row">
        ${profileUrl ? `<a href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" class="heart-crm-action-placeholder heart-crm-action-placeholder--primary">Profil</a>` : ""}
        ${renderCrmEditButton("leads", leadId)}
      </div>
    </article>
  `;
}

function renderCustomerCard(rest = {}, sectionState = {}) {
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
      ${renderOwnershipPills(rest, { hideOwn: sectionState.scope === "own" })}
      ${renderExtraMetaChips([
        { label: firstText(rest.ownerEmail, rest.email, rest.socialEmail), tone: "info" },
        { label: firstText(rest.phone), tone: "info" }
      ])}
      <div class="heart-crm-action-row">
        ${renderCrmEditButton("customers", firstText(rest.id, rest.restaurantId, rest.customerId))}
      </div>
    </article>
  `;
}

function renderStaffCard(entry = {}, crmAdmin = {}) {
  const name = firstText(entry.name, entry.displayName, entry.email, "CEO");
  const email = firstText(entry.email);
  const handle = firstText(entry.handle, normalizeHandle(name));
  const currentUid = asText(crmAdmin?.currentUid || "");
  const isSelf = currentUid && asText(entry.uid) === currentUid;
  const relation = firstText(
    entry.relation,
    isSelf ? "Du" : (asText(entry.ceoParentUid) === currentUid ? "Direkt" : "Unterstaff")
  );
  const storedCounts = entry.crmCounts && typeof entry.crmCounts === "object" ? entry.crmCounts : {};
  const loadedLeadRows = Array.isArray(crmAdmin?.sections?.leads?.items) ? crmAdmin.sections.leads.items : [];
  const loadedCustomerRows = Array.isArray(crmAdmin?.sections?.customers?.items) ? crmAdmin.sections.customers.items : [];
  const leadCount = Number.isFinite(Number(storedCounts.ownLeads))
    ? Number(storedCounts.ownLeads)
    : loadedLeadRows.filter((lead) => asText(lead.createdByUid) === asText(entry.uid)).length;
  const customerCount = Number.isFinite(Number(storedCounts.ownCustomers))
    ? Number(storedCounts.ownCustomers)
    : loadedCustomerRows.filter((customer) => asText(customer.createdByUid) === asText(entry.uid)).length;
  const locationText = firstText(entry.locationLabel, entry.location, entry.city, entry.country, "-");
  const avatarUrl = firstText(entry.avatarPreview, entry.avatarUrl, entry.avatar, entry.photoURL);
  const staffId = firstText(entry.uid, entry.userId, entry.id);
  return `
    <button type="button" class="heart-crm-card heart-crm-card--staff heart-crm-card--button" data-action="open-crm-editor" data-crm-domain="staff" data-crm-item-id="${escapeHtml(staffId)}" data-crm-mode="edit" data-staff-edit="${escapeHtml(staffId)}">
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
        { label: locationText }
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
        <span>Tippen zum Bearbeiten</span>
        <span class="heart-crm-footer-icon">${renderHeartIcon("chevronRight")}</span>
      </div>
    </button>
  `;
}

function renderStaffBuildStatusPanel(crmAdmin = {}) {
  const staffSection = crmAdmin?.sections?.staff && typeof crmAdmin.sections.staff === "object"
    ? crmAdmin.sections.staff
    : {};
  const buildStatus = staffSection.buildStatus && typeof staffSection.buildStatus === "object"
    ? staffSection.buildStatus
    : crmAdmin?.buildStatus && typeof crmAdmin.buildStatus === "object"
      ? crmAdmin.buildStatus
    : {};
  const loading = staffSection.buildStatusLoading === true || crmAdmin?.buildStatusLoading === true;
  const error = firstText(staffSection.buildStatusError, crmAdmin?.buildStatusError);
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
      ${loading ? `<p class="heart-crm-build-note">Build Info wird geladen...</p>` : ""}
      ${error ? `<p class="heart-crm-build-note heart-crm-build-note--warning">${escapeHtml(error)}</p>` : ""}
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
  const rawItems = Array.isArray(sectionState.items) ? sectionState.items : [];
  const statusFilter = asText(sectionState.statusFilter);
  const categoryFilter = asText(sectionState.categoryFilter);
  const items = rawItems
    .filter((item) => itemMatchesQuery(item, sectionState.query || ""))
    .filter((item) => sectionKey !== "leads" || itemMatchesLeadCategory(item, categoryFilter))
    .filter((item) => {
      if (sectionKey !== "leads" || !statusFilter) return true;
      return asText(item.status).toLowerCase() === statusFilter;
    });
  const status = asText(sectionState.status);
  const missingContextLabel = getMissingContextLabel(sectionState.missingContext || "");
  if (missingContextLabel) return renderStateBlock(missingContextLabel, "warning");
  if (status === "loading") return renderStateBlock(`${section.title} laden...`, "neutral");
  if (status === "error") return renderStateBlock(sectionState.error || "Read-only Abruf fehlgeschlagen.", "danger");
  if (!items.length) {
    const emptyLabels = {
      leads: "Keine Leads",
      customers: "Keine Kunden",
      staff: "Noch kein CEO Staff"
    };
    return renderStateBlock(emptyLabels[sectionKey] || "Keine Eintraege", "neutral");
  }
  const renderers = {
    leads: (item) => renderLeadCard(item, sectionState),
    customers: (item) => renderCustomerCard(item, sectionState),
    staff: (item) => renderStaffCard(item, crmAdmin)
  };
  const rows = items.map((item) => renderers[sectionKey]?.(item) || "").join("");
  return `
    <div class="heart-crm-list-stack">
      ${rows}
    </div>
  `;
}

function renderSectionTools(sectionKey = "", sectionState = {}, items = [], crmAdmin = {}) {
  return `
    ${renderScopeTabs(sectionKey, sectionState, items, crmAdmin)}
    ${sectionKey === "leads" ? renderLeadCategoryFilter(sectionState) : ""}
    ${renderSearchControl(sectionKey, sectionState)}
    ${sectionKey === "leads" ? renderLeadStatusFilter(sectionState) : ""}
  `;
}

function renderSectionHeaderActions(sectionKey = "") {
  if (sectionKey === "leads") {
    return `
      <div class="heart-crm-header-actions">
        ${renderCrmHeaderAction({ iconName: "settings", domainKey: "leads", mode: "settings", label: "", id: "leadSettingsBtn" })}
        ${renderCrmHeaderAction({ iconName: "plus", domainKey: "leads", mode: "create", label: "", id: "newLeadBtn" })}
      </div>
    `;
  }
  if (sectionKey === "staff") {
    return `
      <div class="heart-crm-header-actions">
        ${renderCrmHeaderAction({ iconName: "plus", domainKey: "staff", mode: "create", label: "", id: "staffNewBtn" })}
      </div>
    `;
  }
  return "";
}

function getSectionCountLabel(sectionKey = "", sectionState = {}, items = [], crmAdmin = {}, ready = false, sectionStatus = "") {
  const activeScope = firstText(sectionState.scope, "own");
  const storedKeyMap = {
    leads: {
      own: "ownLeads",
      staff: "staffLeads",
      archived: "archivedLeads"
    },
    customers: {
      own: "ownCustomers",
      staff: "staffCustomers"
    }
  };
  const storedKey = storedKeyMap[sectionKey]?.[activeScope] || "";
  const storedCount = storedKey ? getStoredScopeCount(crmAdmin, storedKey) : "";
  if (storedCount) return storedCount;
  return ready && sectionStatus === "ready" ? formatKnownCount(sectionState, items) : "Nicht geladen";
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
  const showSectionHeader = section.key !== "leads";
  const showSectionFoot = section.key !== "leads" && section.key !== "staff";
  const emptySessionLabel = section.key === "staff"
    ? "Noch kein Abruf in dieser Session."
    : "Noch kein read-only Abruf in dieser Session.";

  return `
    <section id="${escapeHtml(section.key)}View" class="heart-crm-social-view heart-crm-social-view--${escapeHtml(section.key)}">
      ${showSectionHeader ? `<div class="heart-crm-social-head">
        <div>
          <span class="heart-crm-social-eyebrow">${escapeHtml(section.eyebrow)}</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        ${renderSectionHeaderActions(section.key)}
      </div>` : ""}
      ${renderSectionTools(section.key, sectionState, items, crmAdmin)}
      ${section.key === "staff" ? renderStaffBuildStatusPanel(crmAdmin) : ""}
      ${ready ? "" : renderStateBlock(`Read loader fehlt: ${missingDeps}.`, "warning")}
      ${ready && !canShowList ? renderStateBlock(emptySessionLabel, "neutral") : ""}
      ${canShowList ? renderSectionList(section.key, section, sectionState, crmAdmin) : ""}
      ${sectionState.hasMore ? renderStateBlock(sectionState.loadingMore ? "Laedt..." : "Scrollt weiter...", "neutral") : ""}
      ${showSectionFoot ? `<div class="heart-crm-section-foot">
        ${renderBadge(getSectionStatusLabel(sectionState, ready), getSectionBadgeTone(sectionState, ready))}
        <span>Count ${escapeHtml(getSectionCountLabel(section.key, sectionState, items, crmAdmin, ready, sectionStatus))}</span>
      </div>` : ""}
    </section>
  `;
}

function findCrmItem(crmAdmin = {}, domainKey = "", itemId = "") {
  const safeDomain = asText(domainKey);
  const safeId = asText(itemId);
  if (!safeDomain || !safeId) return null;
  const items = Array.isArray(crmAdmin?.sections?.[safeDomain]?.items)
    ? crmAdmin.sections[safeDomain].items
    : [];
  return items.find((item) => [
    item?.id,
    item?.leadId,
    item?.restaurantId,
    item?.customerId,
    item?.uid,
    item?.userId
  ].some((value) => asText(value) === safeId)) || null;
}

function renderModalField(label = "", value = "", {
  multiline = false,
  wide = false,
  id = "",
  type = "text",
  placeholder = "",
  readonly = false,
  disabled = false,
  min = "",
  step = "",
  options = null,
  checked = false
} = {}) {
  const safeLabel = asText(label);
  const safeValue = asText(value);
  const fieldClass = `heart-crm-modal-field ${wide || multiline ? "heart-crm-modal-field--wide" : ""}`;
  const attrs = [
    id ? `id="${escapeHtml(id)}"` : "",
    `name="${escapeHtml(id || safeLabel)}"`,
    placeholder ? `placeholder="${escapeHtml(placeholder)}"` : "",
    min !== "" ? `min="${escapeHtml(min)}"` : "",
    step !== "" ? `step="${escapeHtml(step)}"` : "",
    readonly ? "readonly" : "",
    disabled ? "disabled" : ""
  ].filter(Boolean).join(" ");
  if (Array.isArray(options)) {
    return `
      <label class="${fieldClass}">
        <span>${escapeHtml(safeLabel)}</span>
        <select ${attrs}>
          ${options.map((option) => {
            const optionValue = typeof option === "object" ? option.value : option;
            const optionLabel = typeof option === "object" ? option.label : option;
            return `<option value="${escapeHtml(optionValue)}" ${asText(optionValue) === safeValue ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
          }).join("")}
        </select>
      </label>
    `;
  }
  if (type === "checkbox") {
    return `
      <label class="${fieldClass} heart-crm-modal-field--checkbox">
        <span>${escapeHtml(safeLabel)}</span>
        <input ${attrs} type="checkbox" ${checked ? "checked" : ""} />
      </label>
    `;
  }
  if (multiline) {
    return `
      <label class="${fieldClass}">
        <span>${escapeHtml(safeLabel)}</span>
        <textarea ${attrs}>${escapeHtml(safeValue)}</textarea>
      </label>
    `;
  }
  return `
    <label class="${fieldClass}">
      <span>${escapeHtml(safeLabel)}</span>
      <input ${attrs} type="${escapeHtml(type)}" value="${escapeHtml(safeValue)}" />
    </label>
  `;
}

function renderModalFieldset(title = "", innerHtml = "") {
  if (!String(innerHtml || "").trim()) return "";
  return `
    <section class="heart-crm-modal-fieldset">
      <p>${escapeHtml(title)}</p>
      <div class="heart-crm-modal-grid">
        ${innerHtml}
      </div>
    </section>
  `;
}

function renderImageEditor({ imageUrl = "", label = "", inputId = "", triggerId = "", previewId = "", valueId = "" } = {}) {
  const safeImageUrl = asText(imageUrl);
  const safeLabel = firstText(label, "M");
  return `
    <div class="heart-crm-image-editor">
      <div class="heart-crm-avatar heart-crm-avatar--large">
        ${safeImageUrl
          ? `<img id="${escapeHtml(previewId)}" src="${escapeHtml(safeImageUrl)}" alt="" loading="lazy" />`
          : `<span id="${escapeHtml(previewId)}">${escapeHtml(getInitials(safeLabel))}</span>`}
      </div>
      <input type="file" id="${escapeHtml(inputId)}" data-crm-file-input="${escapeHtml(inputId)}" accept="image/*" hidden />
      <button type="button" id="${escapeHtml(triggerId)}" class="heart-crm-action-placeholder" data-action="trigger-crm-file" data-crm-file-input="${escapeHtml(inputId)}">
        ${renderHeartIcon("camera")} <span>${escapeHtml(label)}</span>
      </button>
      ${valueId ? `<input type="hidden" id="${escapeHtml(valueId)}" value="${escapeHtml(safeImageUrl)}" />` : ""}
    </div>
  `;
}

function formatCoordLabel(item = {}) {
  const lat = Number(item?.lat ?? item?.gpsLat ?? item?.coords?.lat ?? item?.coords?.latitude);
  const lng = Number(item?.lng ?? item?.gpsLng ?? item?.coords?.lng ?? item?.coords?.lon ?? item?.coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function renderLeadLocationRows(lead = {}) {
  const fallbackCoords = Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))
    ? { lat: Number(lead.lat), lng: Number(lead.lng) }
    : null;
  const source = Array.isArray(lead.locations) && lead.locations.length
    ? lead.locations
    : [{ address: firstText(lead.address, lead.city), ...(fallbackCoords || {}) }];
  const rows = source.length ? source : [{ address: "" }];
  return rows.slice(0, 12).map((location, index) => {
    const coordsLabel = formatCoordLabel(location);
    return `
      <div class="heart-crm-location-row">
        <div class="heart-crm-location-row__head">
          <span>Standort ${index + 1}</span>
          ${index > 0 ? `<button type="button" class="heart-crm-footer-icon" data-action="remove-crm-lead-location" data-lead-location-remove="${index}">${renderHeartIcon("x")}</button>` : ""}
        </div>
        <label class="heart-crm-modal-field heart-crm-modal-field--wide">
          <span>Adresse</span>
          <input id="leadLocationAddress_${index}" name="leadLocationAddress_${index}" data-lead-location-address="${index}" type="text" value="${escapeHtml(firstText(location.address, index === 0 ? lead.address : ""))}" placeholder="Plus Code oder Adresse" />
        </label>
        <div id="leadLocationCoords_${index}" class="heart-crm-coords-label ${coordsLabel ? "" : "heart-crm-coords-label--hidden"}">
          ${renderHeartIcon("checkCircle")} ${escapeHtml(coordsLabel || "Standort auf Karte fixiert")}
        </div>
        <button type="button" class="heart-crm-action-placeholder heart-crm-action-placeholder--primary" data-action="pick-crm-lead-location" data-lead-location-pick="${index}">
          ${renderHeartIcon("mapPin")} <span>Auf Karte festlegen</span>
        </button>
      </div>
    `;
  }).join("");
}

function renderModalMissingWriteNotice(domainKey = "") {
  const deps = HEART_CRM_ADMIN_WRITE_VIEW_MISSING_DEPS[domainKey] || [];
  if (!deps.length) return "";
  return `
    <div class="heart-crm-modal-notice">
      <strong>Schreibaktionen deaktiviert</strong>
      <span>Fehlende Facade-Dependencies: ${escapeHtml(deps.join(", "))}</span>
    </div>
  `;
}

function renderLeadEditorModalBody(lead = {}, mode = "edit") {
  const isCreate = mode === "create";
  const title = isCreate ? "Neuer Lead" : "Lead bearbeiten";
  const logoUrl = firstText(lead.logoUrl, lead.logo, lead.imageUrl, lead.bestSpotLogoUrl);
  const bestSpotLogoUrl = firstText(lead.bestSpotLogoUrl, lead.spotLogoUrl, logoUrl);
  const titleImageUrl = firstText(lead.titleImageUrl, lead.coverImageUrl, lead.coverUrl, lead.heroUrl);
  const businessName = firstText(lead.businessName, lead.restaurantName, lead.name);
  const statusValue = firstText(lead.status, "registered");
  const customerType = firstText(lead.customerType, lead.type, "cafe");
  const country = firstText(lead.country, LEAD_SETTINGS_DEFAULT_COUNTRY);
  const currencyCode = firstText(lead.currencyCode, lead.currency, country === "Serbien" ? "RSD" : country === "Albanien" ? "LEK" : "EUR");
  const billingCycle = firstText(lead.billingCycle, "monthly");
  const monthlyPrice = Number(lead.monthlyPrice);
  const yearlyPrice = Number(lead.yearlyPrice);
  const activePrice = Number(lead.price);
  const typeOptions = LEAD_TYPE_ORDER.map((key) => ({ value: key, label: LEAD_TYPE_LABELS[key] || key }));
  const statusOptions = LEAD_STATUS_ORDER.map((key) => ({ value: key, label: LEAD_STATUS_LABELS[key] || key }));
  const countryOptions = CEO_COUNTRIES.map((key) => ({ value: key, label: key }));
  const locationRows = renderLeadLocationRows(lead);
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CRM</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <button id="leadModalClose" class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      <div class="heart-crm-image-grid">
        ${renderImageEditor({ imageUrl: logoUrl, label: "Logo hochladen", inputId: "leadLogoInput", triggerId: "leadLogoTrigger", previewId: "leadLogoPreview", valueId: "leadLogoUrl" })}
        ${renderImageEditor({ imageUrl: bestSpotLogoUrl, label: "Best-Spot-Logo hochladen", inputId: "leadBestSpotLogoInput", triggerId: "leadBestSpotLogoTrigger", previewId: "leadBestSpotLogoPreview", valueId: "leadBestSpotLogoUrl" })}
        ${renderImageEditor({ imageUrl: titleImageUrl, label: "Titelbild hochladen", inputId: "leadTitleImageInput", triggerId: "leadTitleImageTrigger", previewId: "leadTitleImagePreview", valueId: "leadTitleImageUrl" })}
      </div>
      ${renderModalMissingWriteNotice("leads")}
      ${renderModalFieldset("Lead", `
        ${renderModalField("Typ", customerType, { id: "leadCustomerType", options: typeOptions })}
        ${renderModalField("Business Name", businessName, { id: "leadBusinessName", placeholder: "Business Name" })}
        ${renderModalField("Email", firstText(lead.email, lead.socialEmail), { id: "leadEmail", type: "email", placeholder: "owner@mnyra.com", readonly: isCreate })}
        ${renderModalField("Passwort", firstText(lead.password), { id: "leadPassword", type: "password", placeholder: "leer = kein Login wird erstellt" })}
        ${renderModalField("Status", statusValue, { id: "leadStatus", options: statusOptions })}
      `)}
      ${renderModalFieldset("Kunden Daten", `
        ${renderModalField("Vorname", firstText(lead.contactFirstName), { id: "leadCustomerFirstName", placeholder: "Vorname" })}
        ${renderModalField("Nachname", firstText(lead.contactLastName), { id: "leadCustomerLastName", placeholder: "Nachname" })}
        ${renderModalField("Kontakt", firstText(lead.contactName), { id: "leadContactName", placeholder: "Kontaktname" })}
        ${renderModalField("Telefon", firstText(lead.phone), { id: "leadPhone", placeholder: "+383" })}
        ${renderModalField("Instagram", firstText(lead.instagram, lead.insta), { id: "leadInstagram", placeholder: "@mnyra" })}
        ${renderModalField("Facebook", firstText(lead.facebook), { id: "leadFacebook", placeholder: "Facebook" })}
        ${renderModalField("TikTok", firstText(lead.tiktok), { id: "leadTiktok", placeholder: "TikTok" })}
        ${renderModalField("Google Maps", firstText(lead.googleMaps), { id: "leadGoogleMaps", placeholder: "https://maps.google.com/...", wide: true })}
      `)}
      ${renderModalFieldset("Restaurant Card", `
        ${renderModalField("Oeffnungszeiten", firstText(lead.openingHours, lead.hours), { id: "leadOpeningHours", placeholder: "Mo - So: 11:00 - 22:00 Uhr", wide: true })}
        ${renderModalField("Garten / Terrasse", firstText(lead.gardenTerraceText, lead.restaurantFeatures?.gardenTerrace), { id: "leadGardenTerraceText", placeholder: "Gastgarten" })}
        ${renderModalField("Barrierefrei", firstText(lead.accessibilityText, lead.restaurantFeatures?.accessibility), { id: "leadAccessibilityText", placeholder: "Barrierefrei" })}
        ${renderModalField("Vegane Optionen", firstText(lead.veganOptionsText, lead.restaurantFeatures?.veganOptions), { id: "leadVeganOptionsText", placeholder: "Vegane Optionen", wide: true })}
      `)}
      ${renderModalFieldset("Abo", `
        ${renderModalField("Laufzeit", billingCycle, { id: "leadBillingCycle", options: [
          { value: "monthly", label: "Monatlich" },
          { value: "yearly", label: "Jaehrlich" }
        ] })}
        ${renderModalField("Preis monatlich", Number.isFinite(monthlyPrice) ? `${monthlyPrice.toFixed(2)} ${currencyCode} / Monat` : `0.00 ${currencyCode} / Monat`, { id: "leadMonthlyPrice", readonly: true })}
        ${renderModalField("Preis jaehrlich", Number.isFinite(yearlyPrice) ? `${yearlyPrice.toFixed(2)} ${currencyCode} / Jahr` : `0.00 ${currencyCode} / Jahr`, { id: "leadAnnualPrice", readonly: true })}
        ${renderModalField("Aktueller Preis", Number.isFinite(activePrice) ? `${activePrice.toFixed(2)} ${currencyCode}` : `0.00 ${currencyCode}`, { id: "leadPriceValue", readonly: true })}
      `)}
      <section class="heart-crm-modal-fieldset">
        <div class="heart-crm-location-head">
          <p>Standorte</p>
          <button type="button" class="heart-crm-action-placeholder" data-action="add-crm-lead-location" data-lead-location-add>${renderHeartIcon("plus")} <span>Standort</span></button>
        </div>
        <div class="heart-crm-location-list">${locationRows}</div>
      </section>
      ${renderModalFieldset("Adresse", `
        ${renderModalField("Land", country, { id: "leadCountry", options: countryOptions })}
        ${renderModalField("Waehrung", currencyCode, { id: "leadCurrency", readonly: true })}
        ${renderModalField("Stadt", firstText(lead.city), { id: "leadCity", placeholder: "Stadt" })}
        ${renderModalField("Adresse", firstText(lead.address), { id: "leadAddress", placeholder: "Adresse" })}
        ${renderModalField("ZIP Code", firstText(lead.zipCode), { id: "leadZipCode", placeholder: "10000" })}
        ${renderModalField("Notiz", firstText(lead.note), { id: "leadNote", multiline: true, placeholder: "Kurz notieren..." })}
        ${renderModalField("Special aktivieren", "", { id: "leadSpecialEnabled", type: "checkbox", checked: lead.specialEnabled === true, wide: true })}
      `)}
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer">
      <button id="leadInlineDeleteBtn" class="heart-button heart-button--secondary" data-action="delete-crm-lead" type="button" ${isCreate ? "disabled aria-disabled=\"true\"" : ""}>Lead loeschen</button>
      <button id="leadConvertBtn" class="heart-button heart-button--secondary" data-action="convert-crm-lead" type="button" ${isCreate ? "disabled aria-disabled=\"true\"" : ""}>Zu Kunde</button>
      <button id="leadInlineSaveBtn" class="heart-button heart-button--primary" data-action="save-crm-lead" type="button">Speichern</button>
    </div>
  `;
}

function renderCustomerEditorModalBody(customer = {}) {
  const logoUrl = firstText(customer.logoUrl, customer.logo, customer.imageUrl);
  const name = firstText(customer.name, customer.restaurantName, customer.businessName);
  const statusValue = normalizeHeartLeadStatus(firstText(customer.status, "kunde"), "kunde");
  const typeOptions = LEAD_TYPE_ORDER.map((key) => ({ value: key, label: LEAD_TYPE_LABELS[key] || key }));
  const statusOptions = LEAD_STATUS_ORDER.map((key) => ({ value: key, label: LEAD_STATUS_LABELS[key] || key }));
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CRM</p>
        <h2>Kunde bearbeiten</h2>
      </div>
      <button id="customerModalClose" class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      ${renderImageEditor({ imageUrl: logoUrl, label: "Logo hochladen", inputId: "customerLogoInput", triggerId: "customerLogoTrigger", previewId: "customerLogoPreview" })}
      ${renderModalMissingWriteNotice("customers")}
      ${renderModalFieldset("Kundenprofil", `
        ${renderModalField("Business Name", name, { id: "customerName", placeholder: "Business Name" })}
        ${renderModalField("Typ", firstText(customer.type, customer.customerType, "cafe"), { id: "customerType", options: typeOptions })}
        ${renderModalField("Owner", firstText(customer.ownerName, customer.contactName), { id: "customerOwnerName", placeholder: "Owner Name" })}
        ${renderModalField("Email", firstText(customer.ownerEmail, customer.email, customer.socialEmail), { id: "customerOwnerEmail", type: "email", placeholder: "owner@mnyra.com" })}
        ${renderModalField("Telefon", firstText(customer.phone), { id: "customerPhone", placeholder: "+383" })}
        ${renderModalField("City", firstText(customer.city), { id: "customerCity", placeholder: "Prishtina" })}
        ${renderModalField("Adresse", firstText(customer.address), { id: "customerAddress", placeholder: "Strasse, Nr", wide: true })}
        ${renderModalField("Instagram", firstText(customer.instagram, customer.insta), { id: "customerInstagram", placeholder: "@mnyra" })}
        ${renderModalField("Logo URL", logoUrl, { id: "customerLogoUrl", placeholder: "https://..." })}
        ${renderModalField("Status", statusValue, { id: "customerStatus", options: statusOptions })}
      `)}
      ${renderStateBlock(CUSTOMER_DELETE_DISABLED_REASON, "warning")}
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer heart-crm-modal-footer--customer">
      <button id="customerDeleteBtn" class="heart-button heart-button--secondary" type="button" disabled aria-disabled="true" title="${escapeHtml(CUSTOMER_DELETE_DISABLED_REASON)}">Kunde loeschen</button>
      <button id="customerBackToLeadBtn" class="heart-button heart-button--secondary" data-action="move-crm-customer-to-lead" type="button">Zurueck zu Leads</button>
      <button id="customerModalSave" class="heart-button heart-button--primary" data-action="save-crm-customer" type="button">Kunde speichern</button>
    </div>
  `;
}

function renderStaffEditorModalBody(entry = {}, crmAdmin = {}, mode = "edit") {
  const isCreate = mode === "create";
  const name = firstText(entry.name, entry.displayName, entry.email, isCreate ? "" : "CEO");
  const fallbackParts = name.split(/\s+/).filter(Boolean);
  const firstName = isCreate ? firstText(entry.firstName) : firstText(entry.firstName, fallbackParts[0]);
  const lastName = isCreate ? firstText(entry.lastName) : firstText(entry.lastName, fallbackParts.slice(1).join(" "));
  const currentUid = asText(crmAdmin?.currentUid || "");
  const isSelf = currentUid && asText(entry.uid) === currentUid;
  const avatarUrl = firstText(entry.avatarPreview, entry.avatarUrl, entry.avatar, entry.photoURL);
  const coordsLabel = formatCoordLabel(entry);
  const countryOptions = CEO_COUNTRIES.map((key) => ({ value: key, label: key }));
  const saving = entry.saving === true;
  const deleting = entry.deleting === true;
  const status = firstText(entry.statusMessage, entry.status);
  const error = firstText(entry.errorMessage, entry.error);
  const saveLabel = saving
    ? (isCreate ? "Erstelle CEO..." : "Speichern...")
    : (isCreate ? "CEO erstellen" : "CEO speichern");
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CEO</p>
        <h2>${escapeHtml(isCreate ? "Create CEO" : "Edit CEO")}</h2>
      </div>
      <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      ${renderImageEditor({ imageUrl: avatarUrl, label: "Profilbild hochladen", inputId: "staffAvatarInput", triggerId: "staffAvatarTrigger", previewId: "staffAvatarPreview" })}
      ${renderModalMissingWriteNotice("staff")}
      ${renderModalFieldset("CEO", `
        ${renderModalField("Vorname", firstName, { id: "staffFirstName", placeholder: "Vorname" })}
        ${renderModalField("Nachname", lastName, { id: "staffLastName", placeholder: "Nachname" })}
        ${renderModalField("Email", firstText(entry.email), { id: "staffEmail", type: "email", placeholder: "vornamenachname@mnyra.com", readonly: true })}
        ${renderModalField("Passwort", isCreate ? firstText(entry.password) : "", { id: "staffPassword", type: "password", placeholder: isCreate ? "Passwort eingeben" : "Passwort bleibt unveraendert", disabled: !isCreate })}
        ${renderModalField("Land", firstText(entry.country, LEAD_SETTINGS_DEFAULT_COUNTRY), { id: "staffCountry", options: countryOptions })}
        ${renderModalField("Standort", firstText(entry.locationLabel, entry.location, entry.city), { id: "staffLocationLabel", placeholder: "Standort / Adresse", wide: true })}
      `)}
      <section class="heart-crm-modal-fieldset">
        <div class="heart-crm-location-head">
          <p>Standort mit Pin</p>
          <button type="button" id="staffLocationPickBtn" class="heart-crm-action-placeholder heart-crm-action-placeholder--primary" data-action="pick-crm-staff-location">
            ${renderHeartIcon("mapPin")} <span>Standort mit Pin waehlen</span>
          </button>
        </div>
        <div id="staffCoordsDisplay" class="heart-crm-coords-label ${coordsLabel ? "" : "heart-crm-coords-label--hidden"}">
          ${renderHeartIcon("checkCircle")} ${escapeHtml(coordsLabel || "Kein Pin gesetzt")}
        </div>
      </section>
      ${renderModalFieldset("Rolle", `
        ${renderModalField("Rolle", isSelf ? "Du" : (asText(entry.ceoParentUid) === currentUid ? "Direkt" : "Unterstaff"), { readonly: true })}
      `)}
      ${error ? renderStateBlock(error, "danger") : ""}
      ${status ? renderStateBlock(status, "neutral") : ""}
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer">
      ${isCreate ? "" : `<button id="staffDeleteBtn" class="heart-button heart-button--secondary" data-action="delete-crm-staff" type="button" ${(deleting || isSelf) ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(deleting ? "Loeschen..." : "CEO loeschen")}</button>`}
      <button id="staffSaveBtn" class="heart-button heart-button--primary" data-action="save-crm-staff" type="button" ${saving ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(saveLabel)}</button>
    </div>
  `;
}

export function renderHeartCrmAdminModal({ crmAdmin = null, modal = {} } = {}) {
  if (asText(modal?.kind) !== "crm-editor") return "";
  const domainKey = asText(modal.crmDomain);
  if (domainKey === "leads" || domainKey === "staff") return "";
  const mode = asText(modal.mode) || "edit";
  const modalDraft = modal.draft && typeof modal.draft === "object" ? modal.draft : {};
  const baseItem = mode === "create" ? {} : findCrmItem(crmAdmin || {}, domainKey, modal.itemId);
  const item = mode === "create"
    ? modalDraft
    : (baseItem ? { ...baseItem, ...modalDraft } : baseItem);
  const overlayId = domainKey === "leads" ? "leadModalOverlay" : domainKey === "customers" ? "customerModalOverlay" : "";
  const body = (() => {
    if (!item && mode !== "create") {
      return `
        <div class="heart-modal__header">
          <div>
            <p class="heart-page-header__eyebrow">CRM</p>
            <h2>Eintrag nicht gefunden</h2>
          </div>
          <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
        </div>
        <div class="heart-crm-modal-body">${renderStateBlock("Der ausgewaehlte CRM Eintrag ist nicht in der aktuellen Liste geladen.", "warning")}</div>
      `;
    }
    if (domainKey === "leads") return renderLeadEditorModalBody(item || {}, mode);
    if (domainKey === "customers") return renderCustomerEditorModalBody(item || {});
    if (domainKey === "staff") return renderStaffEditorModalBody(item || {}, crmAdmin || {}, mode);
    return `
      <div class="heart-modal__header">
        <div>
          <p class="heart-page-header__eyebrow">CRM</p>
          <h2>Nicht verfuegbar</h2>
        </div>
        <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-crm-modal-body">${renderStateBlock("Diese CRM Ansicht ist in Heart nicht sichtbar.", "warning")}</div>
    `;
  })();
  return `
    <div class="heart-modal">
      <button class="heart-modal__backdrop" ${overlayId ? `id="${escapeHtml(overlayId)}"` : ""} data-action="close-modal" aria-label="Modal schliessen"></button>
      <div class="heart-modal__sheet heart-modal__sheet--detail heart-crm-modal-sheet" role="dialog" aria-modal="true">
        ${body}
      </div>
    </div>
  `;
}

function renderInlineLeadSettings(crmAdmin = {}, modal = {}) {
  const draft = modal?.draft && typeof modal.draft === "object" ? modal.draft : {};
  const config = resolveLeadSettingsConfig(crmAdmin, modal);
  const saving = draft.settingsSaving === true;
  const status = firstText(draft.settingsStatus);
  const countryOptions = CEO_COUNTRIES.map((country) => ({
    value: country,
    label: country
  }));
  return `
    <section class="heart-crm-inline-editor heart-crm-inline-editor--lead-settings">
      <div class="heart-modal__header">
        <div>
          <p class="heart-page-header__eyebrow">CRM</p>
          <h2>Lead Settings</h2>
        </div>
        <button class="heart-icon-button" data-action="close-modal" aria-label="Zurueck">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-crm-modal-body">
        ${renderModalFieldset("Standard", `
          ${renderModalField("Standard Standort Land", config.defaultCountry, { id: "leadSettingsDefaultCountry", options: countryOptions, wide: true })}
        `)}
        <section class="heart-crm-modal-fieldset">
          <p>Lead Typen / Monatlicher Abo Preis</p>
          <div class="heart-crm-modal-grid">
            ${LEAD_TYPE_ORDER.map((key) => {
              const price = Number(config.pricing?.[key]) || 0;
              return renderModalField(LEAD_TYPE_LABELS[key] || key, price ? price.toFixed(2) : "0.00", {
                id: `leadPrice_${key}`,
                type: "number",
                min: "0",
                step: "0.01",
                placeholder: "0.00"
              });
            }).join("")}
          </div>
        </section>
        ${status ? renderStateBlock(status, "neutral") : ""}
      </div>
      <div class="heart-modal__footer heart-crm-modal-footer">
        <button id="leadSettingsSaveBtn" class="heart-button heart-button--primary heart-button--wide" data-action="save-crm-lead-settings" type="button" ${saving ? "disabled aria-disabled=\"true\"" : ""}>
          ${escapeHtml(saving ? "Speichern..." : "Leads Settings speichern")}
        </button>
      </div>
    </section>
  `;
}

function renderInlineLeadEditor(crmAdmin = {}, modal = {}) {
  const mode = asText(modal.mode) || "edit";
  const modalDraft = modal.draft && typeof modal.draft === "object" ? modal.draft : {};
  const baseItem = mode === "create" ? {} : findCrmItem(crmAdmin || {}, "leads", modal.itemId);
  const item = mode === "create"
    ? modalDraft
    : (baseItem ? { ...baseItem, ...modalDraft } : baseItem);
  if (!item && mode !== "create") {
    return `
      <section class="heart-crm-inline-editor heart-crm-inline-editor--lead">
        <div class="heart-modal__header">
          <div>
            <p class="heart-page-header__eyebrow">CRM</p>
            <h2>Lead nicht gefunden</h2>
          </div>
          <button class="heart-icon-button" data-action="close-modal" aria-label="Zurueck">${renderHeartIcon("x")}</button>
        </div>
        <div class="heart-crm-modal-body">${renderStateBlock("Der ausgewaehlte Lead ist nicht in der aktuellen Liste geladen.", "warning")}</div>
      </section>
    `;
  }
  return `
    <section class="heart-crm-inline-editor heart-crm-inline-editor--lead">
      ${renderLeadEditorModalBody(item || {}, mode)}
    </section>
  `;
}

function renderInlineStaffEditor(crmAdmin = {}, modal = {}) {
  const mode = asText(modal.mode) || "edit";
  const modalDraft = modal.draft && typeof modal.draft === "object" ? modal.draft : {};
  const baseItem = mode === "create" ? {} : findCrmItem(crmAdmin || {}, "staff", modal.itemId);
  const item = mode === "create"
    ? modalDraft
    : (baseItem ? { ...baseItem, ...modalDraft } : baseItem);
  if (!item && mode !== "create") {
    return `
      <section class="heart-crm-inline-editor heart-crm-inline-editor--staff">
        <div class="heart-modal__header">
          <div>
            <p class="heart-page-header__eyebrow">CEO</p>
            <h2>Staff nicht gefunden</h2>
          </div>
          <button class="heart-icon-button" data-action="close-modal" aria-label="Zurueck">${renderHeartIcon("x")}</button>
        </div>
        <div class="heart-crm-modal-body">${renderStateBlock("Der ausgewaehlte Staff-Eintrag ist nicht in der aktuellen Liste geladen.", "warning")}</div>
      </section>
    `;
  }
  return `
    <section class="heart-crm-inline-editor heart-crm-inline-editor--staff">
      ${renderStaffEditorModalBody(item || {}, crmAdmin || {}, mode)}
    </section>
  `;
}

export function renderHeartCrmAdminReadView({ consumerDeps = {}, crmAdmin = null, activeDomain = "leads", modal = {} } = {}) {
  const {
    consumer,
    error
  } = createReadConsumer(consumerDeps);
  const section = CRM_READ_SECTION_BY_KEY[asText(activeDomain)] || CRM_READ_SECTION_BY_KEY.leads;
  const isLeadSettingsOpen = section.key === "leads"
    && asText(modal?.kind) === "crm-editor"
    && asText(modal?.crmDomain) === "leads"
    && asText(modal?.mode) === "settings";
  const isLeadEditorOpen = section.key === "leads"
    && asText(modal?.kind) === "crm-editor"
    && asText(modal?.crmDomain) === "leads"
    && !isLeadSettingsOpen;
  const isStaffEditorOpen = section.key === "staff"
    && asText(modal?.kind) === "crm-editor"
    && asText(modal?.crmDomain) === "staff";

  return `
    <div class="heart-crm-admin-read-shell">
      ${error ? `<div class="heart-error-block">${escapeHtml(error)}</div>` : ""}
      ${isLeadSettingsOpen
        ? renderInlineLeadSettings(crmAdmin || {}, modal || {})
        : isLeadEditorOpen
        ? renderInlineLeadEditor(crmAdmin || {}, modal || {})
        : isStaffEditorOpen
          ? renderInlineStaffEditor(crmAdmin || {}, modal || {})
          : renderCrmReadSection(section, consumer, crmAdmin || {})}
    </div>
  `;
}
