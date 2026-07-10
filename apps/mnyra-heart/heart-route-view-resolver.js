const EXPLICIT_VIEW_ALIASES = Object.freeze({
  crmleads: "crmLeads",
  "crm-leads": "crmLeads",
  "crm_leads": "crmLeads",
  leads: "crmLeads",
  lead: "crmLeads",
  crmcustomers: "crmCustomers",
  "crm-customers": "crmCustomers",
  "crm_customers": "crmCustomers",
  customers: "crmCustomers",
  customer: "crmCustomers",
  kunden: "crmCustomers",
  kunde: "crmCustomers",
  crmads: "crmAds",
  "crm-ads": "crmAds",
  "crm_ads": "crmAds",
  ads: "crmAds",
  ad: "crmAds",
  crmstaff: "crmStaff",
  "crm-staff": "crmStaff",
  "crm_staff": "crmStaff",
  staff: "crmStaff",
  analytics: "analytics",
  analytic: "analytics",
  statistik: "analytics",
  statistiken: "analytics",
  destinations: "destinations",
  destination: "destinations",
  destinationen: "destinations",
  orte: "destinations",
  "orte-destinationen": "destinations"
});

const PATH_VIEW_ALIASES = Object.freeze({
  destinations: "destinations",
  destinationen: "destinations",
  orte: "destinations",
  leads: "crmLeads",
  lead: "crmLeads",
  customers: "crmCustomers",
  customer: "crmCustomers",
  kunden: "crmCustomers",
  kunde: "crmCustomers",
  ads: "crmAds",
  ad: "crmAds"
});

const SAFE_STAFF_CONTEXT_SEGMENTS = new Set([
  "heart",
  "mnyra-heart",
  "mnyraheart",
  "crm",
  "admin"
]);

function normalizeHint(value = "") {
  return String(value || "")
    .trim()
    .replace(/^#+/, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

function safeDecodeSegment(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function normalizePathSegments(pathname = "") {
  return String(pathname || "")
    .split("?")[0]
    .split("#")[0]
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => normalizeHint(safeDecodeSegment(segment)))
    .filter(Boolean);
}

function resolveExplicitView(value = "") {
  return EXPLICIT_VIEW_ALIASES[normalizeHint(value)] || "";
}

function resolveSearchView(search = "") {
  const rawSearch = String(search || "").trim();
  if (!rawSearch) return "";
  const params = new URLSearchParams(rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch);
  const explicitKeys = ["view", "heartView", "heart-view", "crmView", "crm-view"];
  for (const key of explicitKeys) {
    const resolved = resolveExplicitView(params.get(key));
    if (resolved) return resolved;
  }
  return "";
}

function resolveHashView(hash = "") {
  const rawHash = String(hash || "").trim().replace(/^#/, "");
  if (!rawHash) return "";
  const [firstPart] = rawHash.split(/[/?&=]/);
  return resolveExplicitView(firstPart);
}

function isSafeStaffPath(segments = []) {
  const staffIndex = segments.findIndex((segment) => segment === "staff" || segment === "crmstaff" || segment === "crm-staff");
  if (staffIndex < 0) return false;
  if (segments.length === 1 && segments[0] === "staff") return false;
  return segments.some((segment, index) => index !== staffIndex && SAFE_STAFF_CONTEXT_SEGMENTS.has(segment));
}

function resolvePathView(pathname = "") {
  const segments = normalizePathSegments(pathname);
  if (!segments.length) return "";

  for (const segment of segments) {
    const resolved = PATH_VIEW_ALIASES[segment];
    if (resolved) return resolved;
  }

  return isSafeStaffPath(segments) ? "crmStaff" : "";
}

export function resolveHeartRouteView(locationLike = globalThis.location) {
  if (!locationLike) return "";
  return resolveSearchView(locationLike.search)
    || resolveHashView(locationLike.hash)
    || resolvePathView(locationLike.pathname);
}
