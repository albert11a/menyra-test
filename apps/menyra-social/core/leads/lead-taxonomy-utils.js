export function normalizeLeadStatusKeyCore(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const key = raw.replace(/[\s-]+/g, "_");
  if (["kein_interesse", "keine_interesse", "no_interest", "nointerest", "nointeresse"].includes(key)) return "no_interest";
  if (["demo", "testphase", "test_phase", "trial", "test"].includes(key)) return "testphase";
  if (["kunde", "customer", "converted", "active"].includes(key)) return "kunde";
  if (["contacted", "kontakt", "kontaktiert", "follow_up", "waiting", "interested"].includes(key)) return "contacted";
  if (["registered", "registriert", "new", "lead", "prospect", "open"].includes(key)) return "registered";
  if (["archived", "archive", "archiv"].includes(key)) return "no_interest";
  if (["archived", "archive", "archiv"].includes(key)) return "no_interest";
  if ([
    "deleted",
    "delete",
    "geloscht",
    "geloescht",
    "removed",
    "remove",
    "inactive",
    "disabled",
    "blocked"
  ].includes(key)) return "deleted";
  return key;
}

export function leadStatusLabelCore(value, {
  normalizeLeadStatusKeyFn,
  leadStatusLabels = {}
} = {}) {
  const normalizeStatus = typeof normalizeLeadStatusKeyFn === "function"
    ? normalizeLeadStatusKeyFn
    : ((status) => String(status || "").trim());
  const key = normalizeStatus(value || "registered");
  return leadStatusLabels[key] || value || "-";
}

export function customerStatusLabelCore(value, {
  normalizeLeadStatusKeyFn
} = {}) {
  if (!value) return "Kunde";
  const normalizeStatus = typeof normalizeLeadStatusKeyFn === "function"
    ? normalizeLeadStatusKeyFn
    : ((status) => String(status || "").trim());
  const key = normalizeStatus(value || "kunde") || "kunde";
  if (key === "testphase") return "Testphase";
  if (key === "no_interest") return "Pa interes";
  if (key === "registered") return "Registriert";
  if (key === "contacted") return "Kontaktiert";
  if (key === "kunde") return "Kunde";
  return String(value || "").toUpperCase();
}

export function isCustomerRestaurantCore(rest = {}, {
  normalizeLeadStatusKeyFn
} = {}) {
  const normalizeStatus = typeof normalizeLeadStatusKeyFn === "function"
    ? normalizeLeadStatusKeyFn
    : ((status) => String(status || "").trim());
  const statusKey = normalizeStatus(rest.status || "");
  if (statusKey === "kunde") return true;
  return false;
}

export function leadTypeLabelCore(value, {
  normalizeLeadTypeKeyFn,
  leadTypeLabels = {}
} = {}) {
  const normalizeType = typeof normalizeLeadTypeKeyFn === "function"
    ? normalizeLeadTypeKeyFn
    : ((type) => String(type || "").trim());
  const key = normalizeType(value || "cafe");
  return leadTypeLabels[key] || value || "-";
}

export function resolveCustomerTypeCore(value, {
  normalizeLeadTypeKeyFn
} = {}) {
  const normalizeType = typeof normalizeLeadTypeKeyFn === "function"
    ? normalizeLeadTypeKeyFn
    : ((type) => String(type || "").trim());
  const key = normalizeType(value || "cafe");
  return key || "cafe";
}
