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

export const HEART_CRM_ADMIN_READ_VIEW_MISSING_DEPS = Object.freeze({
  leads: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.leads]),
  customers: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.customers]),
  staff: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.staff]),
  businessAccounts: Object.freeze([HEART_CRM_ADMIN_READ_LOADER_DEPS.businessAccounts])
});

export const HEART_CRM_ADMIN_WRITE_VIEW_MISSING_DEPS = Object.freeze({
  leads: Object.freeze(["saveLeadFromModal", "deleteLeadFromModal", "convertLeadToCustomer"]),
  customers: Object.freeze(["saveCustomerFromModal"]),
  staff: Object.freeze(["saveCeoStaffFromView", "deleteCeoStaffFromView"])
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

function normalizeSearchKey(value = "") {
  return asText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function itemMatchesQuery(item = {}, query = "") {
  const queryKey = normalizeSearchKey(query);
  if (!queryKey) return true;
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
    item.status,
    item.customerType,
    item.type,
    item.handle
  ].filter(Boolean).join(" "));
  return haystack.includes(queryKey);
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
  return `
    <button type="button" class="heart-crm-action-placeholder ${escapeHtml(extraClass)}" data-action="open-crm-editor" data-crm-domain="${escapeHtml(safeDomain)}" data-crm-item-id="${escapeHtml(safeId)}" data-crm-mode="edit">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderDisabledCrmAction(label = "", missingDeps = [], iconName = "info") {
  const deps = Array.isArray(missingDeps) ? missingDeps.filter(Boolean).join(", ") : asText(missingDeps);
  return `
    <button type="button" class="heart-crm-icon-button" disabled aria-disabled="true" title="${escapeHtml(deps ? `Fehlt: ${deps}` : "Nicht verfuegbar")}">
      ${escapeHtml(label) ? `<span>${escapeHtml(label)}</span>` : renderHeartIcon(iconName)}
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

function renderScopeTabs(sectionKey = "", sectionState = {}, items = []) {
  const count = formatKnownCount(sectionState, items);
  const activeScope = firstText(sectionState.scope, "own");
  const scopeCounts = sectionState.scopeCounts && typeof sectionState.scopeCounts === "object" ? sectionState.scopeCounts : {};
  const tabSets = {
    leads: [
      { key: "own", label: "Meine Leads", count: activeScope === "own" ? count : firstText(scopeCounts.own, "-") },
      { key: "staff", label: "Staff Leads", count: activeScope === "staff" ? count : firstText(scopeCounts.staff, "-") },
      { key: "archived", label: "Archiviert", count: activeScope === "archived" ? count : firstText(scopeCounts.archived, "-") }
    ],
    customers: [
      { key: "own", label: "Meine Kunden", count: activeScope === "own" ? count : firstText(scopeCounts.own, "-") },
      { key: "staff", label: "Staff Kunden", count: activeScope === "staff" ? count : firstText(scopeCounts.staff, "-") }
    ]
  };
  const tabs = tabSets[sectionKey] || [];
  if (!tabs.length) return "";
  return `
    <div class="heart-crm-scope-grid heart-crm-scope-grid--${escapeHtml(sectionKey)}">
      ${tabs.map((tab) => `
        <button type="button" class="heart-crm-scope-tab ${activeScope === tab.key ? "heart-crm-scope-tab--active" : ""}" data-action="set-crm-scope" data-crm-domain="${escapeHtml(sectionKey)}" data-crm-scope="${escapeHtml(tab.key)}">
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
  return `
    <div class="heart-crm-control-row">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("list")}</span>
      <input type="text" value="${escapeHtml(sectionState.query || "")}" placeholder="${escapeHtml(placeholder)}" data-crm-search data-crm-domain="${escapeHtml(sectionKey)}" />
    </div>
  `;
}

function renderLeadStatusFilter(sectionState = {}) {
  const statusFilter = asText(sectionState.statusFilter);
  return `
    <div class="heart-crm-control-row heart-crm-control-row--select">
      <span class="heart-crm-control-row__icon">${renderHeartIcon("list")}</span>
      <select data-crm-status data-crm-domain="leads">
        <option value="">Alle Status</option>
        ${Object.entries(LEAD_STATUS_LABELS)
          .filter(([key]) => key !== "customer" && key !== "kunde" && key !== "no_interest")
          .map(([key, label]) => `<option value="${escapeHtml(key)}" ${statusFilter === key ? "selected" : ""}>${escapeHtml(label)}</option>`)
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
    <article class="heart-crm-card">
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
  const relation = firstText(entry.relation, isSelf ? "Du" : (entry.ceoParentUid ? "Unterstaff" : "Direkt"));
  const storedCounts = entry.crmCounts && typeof entry.crmCounts === "object" ? entry.crmCounts : {};
  const leadCount = Number.isFinite(Number(storedCounts.ownLeads)) ? Number(storedCounts.ownLeads) : 0;
  const customerCount = Number.isFinite(Number(storedCounts.ownCustomers)) ? Number(storedCounts.ownCustomers) : 0;
  const locationText = firstText(entry.locationLabel, entry.location, entry.city, entry.country, "-");
  const avatarUrl = firstText(entry.avatarPreview, entry.avatarUrl, entry.avatar, entry.photoURL);
  const staffId = firstText(entry.uid, entry.userId, entry.id);
  return `
    <button type="button" class="heart-crm-card heart-crm-card--staff heart-crm-card--button" data-action="open-crm-editor" data-crm-domain="staff" data-crm-item-id="${escapeHtml(staffId)}" data-crm-mode="edit">
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
        { label: firstText(entry.role, entry.staffRole), tone: "info" }
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
        <span class="heart-crm-footer-icon">${renderHeartIcon("edit")}</span>
      </div>
    </button>
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
  const rawItems = Array.isArray(sectionState.items) ? sectionState.items : [];
  const statusFilter = asText(sectionState.statusFilter);
  const items = rawItems
    .filter((item) => itemMatchesQuery(item, sectionState.query || ""))
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
    ${renderSearchControl(sectionKey, sectionState)}
    ${sectionKey === "leads" ? renderLeadStatusFilter(sectionState) : ""}
  `;
}

function renderSectionHeaderActions(sectionKey = "") {
  if (sectionKey === "leads") {
    return `
      <div class="heart-crm-header-actions">
        ${renderDisabledCrmAction("", ["saveLeadSettings"], "settings")}
        ${renderDisabledCrmAction("", HEART_CRM_ADMIN_WRITE_VIEW_MISSING_DEPS.leads, "plus")}
      </div>
    `;
  }
  if (sectionKey === "staff") {
    return `
      <div class="heart-crm-header-actions">
        ${renderDisabledCrmAction("", HEART_CRM_ADMIN_WRITE_VIEW_MISSING_DEPS.staff, "plus")}
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

function renderModalField(label = "", value = "", { multiline = false } = {}) {
  const safeLabel = asText(label);
  const safeValue = asText(value);
  if (multiline) {
    return `
      <label class="heart-crm-modal-field heart-crm-modal-field--wide">
        <span>${escapeHtml(safeLabel)}</span>
        <textarea readonly>${escapeHtml(safeValue)}</textarea>
      </label>
    `;
  }
  return `
    <label class="heart-crm-modal-field">
      <span>${escapeHtml(safeLabel)}</span>
      <input type="text" value="${escapeHtml(safeValue)}" readonly />
    </label>
  `;
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
  const businessName = firstText(lead.businessName, lead.restaurantName, lead.name);
  const statusValue = firstText(lead.status, "registered");
  const locations = Array.isArray(lead.locations) ? lead.locations : [];
  const address = firstText(locations[0]?.address, lead.address, lead.city);
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CRM</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      ${renderAvatar({ imageUrl: logoUrl, label: businessName || "Lead", size: "large" })}
      ${renderModalMissingWriteNotice("leads")}
      <div class="heart-crm-modal-grid">
        ${renderModalField("Typ", typeLabel(firstText(lead.customerType, lead.type, lead.category)))}
        ${renderModalField("Business Name", businessName)}
        ${renderModalField("Email", firstText(lead.email, lead.socialEmail))}
        ${renderModalField("Status", labelFromMap(statusValue, LEAD_STATUS_LABELS))}
        ${renderModalField("Vorname", firstText(lead.contactFirstName))}
        ${renderModalField("Nachname", firstText(lead.contactLastName))}
        ${renderModalField("Telefon", firstText(lead.phone))}
        ${renderModalField("Instagram", firstText(lead.instagram, lead.insta))}
        ${renderModalField("Facebook", firstText(lead.facebook))}
        ${renderModalField("TikTok", firstText(lead.tiktok))}
        ${renderModalField("Google Maps", firstText(lead.googleMaps), { multiline: true })}
        ${renderModalField("Adresse", address, { multiline: true })}
        ${renderModalField("Land", firstText(lead.country))}
        ${renderModalField("Abo", firstText(lead.billingCycle))}
      </div>
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer">
      <button class="heart-button heart-button--secondary" type="button" disabled aria-disabled="true">Lead loeschen</button>
      <button class="heart-button heart-button--secondary" type="button" disabled aria-disabled="true">Zu Kunde</button>
      <button class="heart-button heart-button--primary" type="button" disabled aria-disabled="true">Speichern</button>
    </div>
  `;
}

function renderCustomerEditorModalBody(customer = {}) {
  const logoUrl = firstText(customer.logoUrl, customer.logo, customer.imageUrl);
  const name = firstText(customer.name, customer.restaurantName, customer.businessName);
  const statusValue = firstText(customer.status, "kunde");
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CRM</p>
        <h2>Kunde bearbeiten</h2>
      </div>
      <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      ${renderAvatar({ imageUrl: logoUrl, label: name || "Kunde", size: "large" })}
      ${renderModalMissingWriteNotice("customers")}
      <div class="heart-crm-modal-grid">
        ${renderModalField("Business Name", name)}
        ${renderModalField("Typ", typeLabel(firstText(customer.type, customer.customerType)))}
        ${renderModalField("Status", labelFromMap(statusValue, CUSTOMER_STATUS_LABELS))}
        ${renderModalField("Email", firstText(customer.ownerEmail, customer.email, customer.socialEmail))}
        ${renderModalField("Telefon", firstText(customer.phone))}
        ${renderModalField("Stadt", firstText(customer.city))}
        ${renderModalField("Adresse", firstText(customer.address), { multiline: true })}
        ${renderModalField("Billing", firstText(customer.billingStatus, customer.subscriptionStatus))}
      </div>
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer">
      <button class="heart-button heart-button--primary heart-button--wide" type="button" disabled aria-disabled="true">Kunde speichern</button>
    </div>
  `;
}

function renderStaffEditorModalBody(entry = {}, crmAdmin = {}) {
  const name = firstText(entry.name, entry.displayName, entry.email, "CEO");
  const fallbackParts = name.split(/\s+/).filter(Boolean);
  const firstName = firstText(entry.firstName, fallbackParts[0]);
  const lastName = firstText(entry.lastName, fallbackParts.slice(1).join(" "));
  const currentUid = asText(crmAdmin?.currentUid || "");
  const isSelf = currentUid && asText(entry.uid) === currentUid;
  const avatarUrl = firstText(entry.avatarPreview, entry.avatarUrl, entry.avatar, entry.photoURL);
  return `
    <div class="heart-modal__header">
      <div>
        <p class="heart-page-header__eyebrow">CEO</p>
        <h2>Staff bearbeiten</h2>
      </div>
      <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
    </div>
    <div class="heart-crm-modal-body">
      ${renderAvatar({ imageUrl: avatarUrl, label: name, size: "large" })}
      ${renderModalMissingWriteNotice("staff")}
      <div class="heart-crm-modal-grid">
        ${renderModalField("Vorname", firstName)}
        ${renderModalField("Nachname", lastName)}
        ${renderModalField("Email", firstText(entry.email))}
        ${renderModalField("Land", firstText(entry.country))}
        ${renderModalField("Standort", firstText(entry.locationLabel, entry.location, entry.city), { multiline: true })}
        ${renderModalField("Rolle", isSelf ? "Du" : (entry.ceoParentUid ? "Unterstaff" : "Direkt"))}
      </div>
    </div>
    <div class="heart-modal__footer heart-crm-modal-footer">
      <button class="heart-button heart-button--secondary" type="button" disabled aria-disabled="true">CEO loeschen</button>
      <button class="heart-button heart-button--primary" type="button" disabled aria-disabled="true">CEO speichern</button>
    </div>
  `;
}

export function renderHeartCrmAdminModal({ crmAdmin = null, modal = {} } = {}) {
  if (asText(modal?.kind) !== "crm-editor") return "";
  const domainKey = asText(modal.crmDomain);
  const mode = asText(modal.mode) || "edit";
  const item = mode === "create" ? {} : findCrmItem(crmAdmin || {}, domainKey, modal.itemId);
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
    if (domainKey === "staff") return renderStaffEditorModalBody(item || {}, crmAdmin || {});
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
      <button class="heart-modal__backdrop" data-action="close-modal" aria-label="Modal schliessen"></button>
      <div class="heart-modal__sheet heart-modal__sheet--detail heart-crm-modal-sheet" role="dialog" aria-modal="true">
        ${body}
      </div>
    </div>
  `;
}

export function renderHeartCrmAdminReadView({ consumerDeps = {}, crmAdmin = null, activeDomain = "leads" } = {}) {
  const {
    consumer,
    error
  } = createReadConsumer(consumerDeps);
  const section = CRM_READ_SECTION_BY_KEY[asText(activeDomain)] || CRM_READ_SECTION_BY_KEY.leads;

  return `
    <div class="heart-crm-admin-read-shell">
      ${error ? `<div class="heart-error-block">${escapeHtml(error)}</div>` : ""}
      ${renderCrmReadSection(section, consumer, crmAdmin || {})}
    </div>
  `;
}
