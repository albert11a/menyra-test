export function createLeadScopeMapCore(factory = () => null) {
  return {
    own: factory("own"),
    staff: factory("staff"),
    archived: factory("archived")
  };
}

export function createCustomerScopeMapCore(factory = () => null) {
  return {
    own: factory("own"),
    staff: factory("staff")
  };
}

export function normalizeLeadScopeKeyCore(value) {
  return ["own", "staff", "archived"].includes(String(value || "").trim()) ? String(value || "").trim() : "own";
}

export function normalizeCustomerScopeKeyCore(value) {
  return String(value || "").trim() === "staff" ? "staff" : "own";
}

export function createEmptyLeadsStateCore({
  pageSize = 20
} = {}) {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    error: "",
    query: "",
    status: "",
    scope: "own",
    view: "list",
    settingsSaving: false,
    settingsStatus: "",
    keepFocus: false,
    pages: createLeadScopeMapCore(() => []),
    pageSize: createLeadScopeMapCore(() => pageSize),
    hasMore: createLeadScopeMapCore(() => false),
    loaded: createLeadScopeMapCore(() => false),
    knownCount: createLeadScopeMapCore(() => 0),
    countExact: createLeadScopeMapCore(() => false)
  };
}

export function createEmptyCustomersStateCore({
  pageSize = 20
} = {}) {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    error: "",
    query: "",
    scope: "own",
    keepFocus: false,
    pages: createCustomerScopeMapCore(() => []),
    pageSize: createCustomerScopeMapCore(() => pageSize),
    hasMore: createCustomerScopeMapCore(() => false),
    loaded: createCustomerScopeMapCore(() => false),
    knownCount: createCustomerScopeMapCore(() => 0),
    countExact: createCustomerScopeMapCore(() => false)
  };
}
