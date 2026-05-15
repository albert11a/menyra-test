// Contract-only inventory for the future CRM/Admin move into MNYRA Heart/Admin.
// Do not import this into product flow until a dedicated migration step wires a facade.

export const CRM_ADMIN_FACADE_CONTRACT_VERSION = "crm-admin-facade-contract.v1";

export const CRM_ADMIN_DOMAINS = Object.freeze({
  leadReadLoad: Object.freeze({
    owner: "current social-app CRM runtime",
    futureOwner: "MNYRA Heart/Admin read/load facade",
    status: "contract-only",
    currentRouteTabs: Object.freeze(["/leads", "/ceo", "/admin", "activeTab:leads"]),
    currentFiles: Object.freeze([
      "apps/menyra-social/social-app.js",
      "apps/menyra-social/core/crm/crm-domain-runtime-cluster.js",
      "apps/menyra-social/core/crm/crm-runtime-controller.js",
      "apps/menyra-social/core/crm/crm-scope-state-utils.js",
      "apps/menyra-social/core/crm/crm-ceo-scope-support-runtime.js",
      "apps/menyra-social/core/leads/lead-taxonomy-utils.js",
      "apps/menyra-social/core/auth/tab-auth-load-utils.js"
    ])
  }),
  leadWrite: Object.freeze({
    owner: "current social-app CRM runtime",
    futureOwner: "MNYRA Heart/Admin write facade after read/load facade is stable",
    status: "contract-only",
    currentRouteTabs: Object.freeze(["/leads", "lead modal", "lead inline create", "lead settings"])
  }),
  customer: Object.freeze({
    owner: "current social-app CRM runtime plus shared overlay renderer",
    futureOwner: "MNYRA Heart/Admin customer facade",
    status: "contract-only",
    currentRouteTabs: Object.freeze(["/customers", "activeTab:customers"])
  }),
  staff: Object.freeze({
    owner: "current social-app CRM runtime",
    futureOwner: "MNYRA Heart/Admin staff facade",
    status: "contract-only",
    currentRouteTabs: Object.freeze(["/staff", "activeTab:staff"])
  }),
  businessAccounts: Object.freeze({
    owner: "current social app shell runtime",
    futureOwner: "undecided: Heart/Admin only after business-owner scope is explicit",
    status: "contract-only",
    currentRouteTabs: Object.freeze(["/business-accounts", "/businessaccounts", "activeTab:businessAccounts"])
  }),
  geoMap: Object.freeze({
    owner: "current CRM geo support runtime plus shared Leaflet picker",
    futureOwner: "MNYRA Heart/Admin geo facade only after lead and staff form ownership is explicit",
    status: "contract-only",
    currentSurfaces: Object.freeze(["lead modal", "lead inline create", "staff editor", "locationPickerModal"])
  }),
  uiEvents: Object.freeze({
    owner: "current social app shell, overlay, and CRM staff event binders",
    futureOwner: "MNYRA Heart/Admin route/event ownership after facade parity",
    status: "contract-only",
    currentSurfaces: Object.freeze(["lead list", "lead modal", "customer modal", "staff editor", "business account editor"])
  }),
  authProfileProvisioning: Object.freeze({
    owner: "current auth profile bootstrap and secondary Firebase auth creation",
    futureOwner: "shared auth/profile contract, not blind CRM move",
    status: "contract-only",
    currentFiles: Object.freeze([
      "apps/menyra-social/core/auth/tab-auth-load-utils.js",
      "apps/menyra-social/core/profile/profile-identity-runtime-cluster.js",
      "apps/menyra-social/core/crm/crm-runtime-controller.js"
    ])
  }),
  routeOwnership: Object.freeze({
    owner: "current social app routes and Vercel rewrites",
    futureOwner: "MNYRA Heart/Admin only after facade parity",
    status: "do-not-move-in-v1-contract-step",
    currentRoutes: Object.freeze(["/leads", "/ceo", "/admin", "/staff", "/customers", "/business-accounts", "/businessaccounts"])
  })
});

export const CRM_ADMIN_REQUIRED_FUNCTIONS = Object.freeze({
  leadReadLoad: Object.freeze([
    "loadLeads",
    "fetchLeadScopeRows",
    "normalizeLeadDoc",
    "normalizeLeadFromRestaurant",
    "leadBelongsToScope",
    "normalizeLeadScopeKey",
    "createLeadScopeMap",
    "readLeadScopeCache",
    "writeLeadScopeCache",
    "queueLeadLandingBackfill",
    "backfillLeadLandingForRows",
    "ensureCeoCrmCountsLoaded",
    "getCeoCrmCountsPromise",
    "getCurrentCeoMeta",
    "canCurrentCeoSeeRow",
    "isCurrentCeoOwnRow",
    "applyKnownLeadOwnershipOverride",
    "resolveKnownLeadOwnerMeta",
    "buildLeadCrmContribution"
  ]),
  leadWrite: Object.freeze([
    "saveLeadFromModal",
    "saveLeadFromModalCore",
    "deleteLeadFromModal",
    "deleteLeadFromModalCore",
    "convertLeadToCustomer",
    "convertLeadToCustomerCore",
    "saveLeadSettings",
    "openLeadCreator",
    "openLeadSettingsView",
    "closeLeadSubview",
    "createLeadDraftState",
    "resetLeadDraft",
    "syncLeadModalDraftFromForm",
    "addLeadModalLocationRow",
    "removeLeadModalLocationRow",
    "ensureRestaurantPublicMeta",
    "createAuthUser",
    "resolveRestaurantStatusFromLead",
    "resolveStoredCeoCreatorMeta",
    "resolveRestaurantLinkedToLead",
    "collectLeadIdentityPayload",
    "deactivateLinkedBusinessUsers",
    "purgeRestaurantSocialPresence",
    "applyDeletedRestaurantStateLocally",
    "buildLeadLandingPageUrl",
    "buildLeadLandingSlug",
    "resolveLeadLandingSlugUnique",
    "applyCeoCrmCountDeltas",
    "accumulateCeoCrmDelta"
  ]),
  customer: Object.freeze([
    "loadCustomers",
    "fetchCustomerScopeRows",
    "refreshCustomersFromRestaurants",
    "customerBelongsToScope",
    "normalizeCustomerScopeKey",
    "createCustomerScopeMap",
    "readCustomerScopeCache",
    "writeCustomerScopeCache",
    "saveCustomerFromModal",
    "saveCustomerFromModalCore",
    "renderCustomersView",
    "renderCustomerModalCore",
    "bindCustomerOverlayEventsCore",
    "closeCustomerModal",
    "buildCustomerCrmContribution",
    "applyCeoCrmCountDeltas",
    "accumulateCeoCrmDelta"
  ]),
  staff: Object.freeze([
    "loadCeoStaff",
    "saveCeoStaffFromView",
    "saveCeoStaffFromViewCore",
    "deleteCeoStaffFromView",
    "openStaffEditor",
    "closeStaffEditor",
    "syncStaffFormFromDom",
    "syncStaffDerivedEmailField",
    "getStaffFormEmail",
    "renderStaffView",
    "renderStaffEditorView",
    "normalizeCeoStaffRecord",
    "hydrateStaffRecordsFromUserProfiles",
    "canViewCeoRecord",
    "createEmptyCeoCrmCounts",
    "sanitizeCeoCrmCounts",
    "saveUserProfileToStorage"
  ]),
  businessAccounts: Object.freeze([
    "createBusinessAccountsRuntimeController",
    "loadBusinessAccounts",
    "saveBusinessAccountFromView",
    "toggleBusinessAccountActive",
    "renderBusinessAccountsView",
    "bindBusinessAccountsEvents",
    "createAuthUser",
    "isBusinessOwnerProfile",
    "getManagedRestaurantId",
    "normalizeStaffRole",
    "normalizeBusinessAccountEntry",
    "createEmptyBusinessAccountForm"
  ]),
  geoMap: Object.freeze([
    "createCrmLeadGeoSupportRuntime",
    "ensureLocationPickerModal",
    "bindLocationPickerEvents",
    "openLocationPicker",
    "closeLocationPicker",
    "confirmLocation",
    "hydrateLeadGeoFieldsFromCoords",
    "syncLeadDerivedFields",
    "readLeadModalLocationsFromForm",
    "refineLeadLocationAddressIndex",
    "getLeadPlusCodeReference",
    "createLeadLocation",
    "normalizeLeadLocations",
    "getPrimaryLeadLocation",
    "hasLeadLocationCoords",
    "resolveCoordsFromEntity",
    "preferStableCoords",
    "normalizeCoordPair",
    "parseCoordsFromAddressInput",
    "parseCoordsFromAddressInputAsync",
    "extractPlusCodeFromText",
    "isLikelyShortPlusCode",
    "resolvePlusCodeReferenceCoords",
    "geocodeReferenceSearch"
  ]),
  uiEvents: Object.freeze([
    "renderLeadsView",
    "renderLeadCreationView",
    "renderLeadSettingsView",
    "renderLeadModalCore",
    "renderCustomersView",
    "renderCustomerModalCore",
    "renderStaffView",
    "renderStaffEditorView",
    "renderBusinessAccountsView",
    "bindCrmStaffEventsCore",
    "bindLeadInlineCreateEventsCore",
    "bindLeadOverlayEventsCore",
    "bindCustomerOverlayEventsCore",
    "bindBusinessAccountsEvents",
    "renderOverlaysCore",
    "bindOverlayEventsCore",
    "ensureTabDataCore"
  ]),
  authProfileProvisioning: Object.freeze([
    "loadAuthProfileCore",
    "resolveLeadByUid",
    "resolveLeadByEmail",
    "findRestaurantByLeadId",
    "ensureRestaurantForLead",
    "loadAuthProfile",
    "ensureUserProfile",
    "createAuthUser",
    "buildBusinessUserBootstrapPayload"
  ]),
  routeOwnership: Object.freeze([
    "resolveSystemRouteTabFromSegment",
    "isReservedPublicRouteSegmentCore",
    "sanitizeTabForSession",
    "ensureTabDataCore"
  ])
});

export const CRM_ADMIN_REQUIRED_STATE_KEYS = Object.freeze({
  root: Object.freeze([
    "state.activeTab",
    "state.user",
    "state.currentUser",
    "state.userProfile",
    "state.restaurants",
    "state.businessLocations",
    "state.verifiedMapLocation",
    "dataLoaded.leads",
    "dataLoaded.customers",
    "dataLoaded.staff",
    "dataLoaded.businessAccounts"
  ]),
  leads: Object.freeze([
    "state.leads.items",
    "state.leads.loading",
    "state.leads.loadingMore",
    "state.leads.error",
    "state.leads.query",
    "state.leads.status",
    "state.leads.scope",
    "state.leads.view",
    "state.leads.settingsSaving",
    "state.leads.settingsStatus",
    "state.leads.keepFocus",
    "state.leads.pages",
    "state.leads.pageSize",
    "state.leads.hasMore",
    "state.leads.loaded",
    "state.leads.knownCount",
    "state.leads.countExact",
    "state.leads.convertingIds"
  ]),
  leadModal: Object.freeze([
    "state.leadModal.open",
    "state.leadModal.mode",
    "state.leadModal.lead",
    "state.leadModal.status",
    "state.leadModal.loading",
    "state.leadModal.saving",
    "state.leadModal.deleting",
    "state.leadModal.actionsOpen",
    "state.leadModal.logoFile",
    "state.leadModal.logoPreview",
    "state.leadModal.bestSpotLogoFile",
    "state.leadModal.bestSpotLogoPreview",
    "state.leadModal.coords",
    "state.leadModal.locations",
    "state.leadModal.pendingPublicSlug"
  ]),
  customers: Object.freeze([
    "state.customers.items",
    "state.customers.loading",
    "state.customers.loadingMore",
    "state.customers.error",
    "state.customers.query",
    "state.customers.scope",
    "state.customers.keepFocus",
    "state.customers.pages",
    "state.customers.pageSize",
    "state.customers.hasMore",
    "state.customers.loaded",
    "state.customers.knownCount",
    "state.customers.countExact"
  ]),
  customerModal: Object.freeze([
    "state.customerModal.open",
    "state.customerModal.mode",
    "state.customerModal.customer",
    "state.customerModal.status",
    "state.customerModal.loading",
    "state.customerModal.logoFile",
    "state.customerModal.logoPreview"
  ]),
  staff: Object.freeze([
    "state.staff.items",
    "state.staff.view",
    "state.staff.editorUid",
    "state.staff.loading",
    "state.staff.loadingMore",
    "state.staff.hasMore",
    "state.staff.pageSize",
    "state.staff.saving",
    "state.staff.deleting",
    "state.staff.error",
    "state.staff.status",
    "state.staff.form.firstName",
    "state.staff.form.lastName",
    "state.staff.form.email",
    "state.staff.form.password",
    "state.staff.form.country",
    "state.staff.form.locationLabel",
    "state.staff.form.coords",
    "state.staff.form.avatarUrl",
    "state.staff.form.avatarPreview",
    "state.staff.form.avatarFile"
  ]),
  businessAccounts: Object.freeze([
    "state.businessAccounts.items",
    "state.businessAccounts.view",
    "state.businessAccounts.editorUid",
    "state.businessAccounts.loading",
    "state.businessAccounts.saving",
    "state.businessAccounts.deleting",
    "state.businessAccounts.loaded",
    "state.businessAccounts.error",
    "state.businessAccounts.status",
    "state.businessAccounts.form.firstName",
    "state.businessAccounts.form.lastName",
    "state.businessAccounts.form.email",
    "state.businessAccounts.form.password",
    "state.businessAccounts.form.role",
    "state.businessAccounts.form.businessAccess",
    "state.businessAccounts.form.waiterAccess",
    "state.businessAccounts.form.active"
  ]),
  entityFields: Object.freeze([
    "id",
    "uid",
    "businessName",
    "restaurantName",
    "name",
    "customerType",
    "type",
    "contactName",
    "ownerName",
    "email",
    "ownerEmail",
    "socialUid",
    "socialEmail",
    "phone",
    "instagram",
    "city",
    "country",
    "address",
    "status",
    "active",
    "hiddenFromDiscover",
    "deleted",
    "leadId",
    "restaurantId",
    "assignedStaffId",
    "createdByStaffId",
    "createdByUid",
    "createdByRole",
    "createdByName",
    "createdByHandle",
    "ceoParentUid",
    "ceoRootUid",
    "ceoRootName",
    "ceoPath",
    "crmCounts"
  ]),
  geoAndPublicFields: Object.freeze([
    "lat",
    "lng",
    "gpsLat",
    "gpsLng",
    "locations",
    "locations[].address",
    "locations[].lat",
    "locations[].lng",
    "plusCode",
    "googleMaps",
    "publicSlug",
    "canonicalPublicPath",
    "landingEnabled",
    "landingTemplate",
    "landingRestaurantId",
    "landingSlug",
    "landingPageUrl",
    "landingScreenOne",
    "publicMetaUpdatedAt"
  ]),
  businessAccessFields: Object.freeze([
    "role",
    "roles",
    "permissions",
    "businessAccess",
    "waiterAccess",
    "staffActive",
    "staffStatus",
    "staffRestaurantId",
    "waiterRestaurantId",
    "businessOwnerUid"
  ])
});

export const CRM_ADMIN_REQUIRED_FIREBASE_PATHS = Object.freeze({
  reads: Object.freeze([
    "leads",
    "restaurants",
    "superadmins",
    "users",
    "users/{uid}",
    "restaurants/{restaurantId}",
    "restaurants/{restaurantId}/staff",
    "restaurants/{restaurantId}/staff/{uid}",
    "restaurants where leadId == lead.id",
    "publicRoutes",
    "restaurants queried by public slug fields",
    "leads queried by owner uid or email",
    "leads for staff crm count hydration",
    "restaurants for staff crm count hydration"
  ]),
  writes: Object.freeze([
    "leads/{leadId}",
    "restaurants/{restaurantId}",
    "restaurants/{restaurantId}/public/meta",
    "users/{socialUid}",
    "users/{uid}",
    "superadmins/{uid}",
    "restaurants/{customerId}",
    "restaurants/{customerId}/public/meta",
    "restaurants/{restaurantId}/staff/{uid}",
    "restaurant social presence collections"
  ]),
  operationsToPreserve: Object.freeze([
    "getDocs(collection(db, 'leads'))",
    "getDocs(collection(db, 'restaurants'))",
    "getDocs(collection(db, 'superadmins'))",
    "getDocs(collection(db, 'restaurants', restaurantId, 'staff'))",
    "getDoc(doc(db, 'users', uid))",
    "getDoc(doc(db, 'restaurants', restaurantId))",
    "getDoc(doc(db, 'restaurants', restaurantId, 'staff', uid))",
    "setDoc(..., { merge: true }) for lead, restaurant, public meta, user, staff, and business account paths",
    "deleteDoc(doc(db, 'leads', leadId))",
    "deleteDoc(doc(db, 'superadmins', uid))",
    "deleteDoc(doc(db, 'users', uid))",
    "applyCeoCrmCountDeltas writes users/{uid} and superadmins/{uid} crmCounts"
  ])
});

export const CRM_ADMIN_REQUIRED_UI_ACTIONS = Object.freeze({
  routeTabs: Object.freeze([
    "activeTab:leads",
    "activeTab:customers",
    "activeTab:staff",
    "activeTab:businessAccounts",
    "/leads",
    "/ceo",
    "/admin",
    "/staff",
    "/customers",
    "/business-accounts",
    "/businessaccounts"
  ]),
  leadActions: Object.freeze([
    "newLeadBtn",
    "leadSettingsBtn",
    "data-leads-back",
    "leadSettingsSaveBtn",
    "leadsSearchInput",
    "leadsStatusFilter",
    "data-lead-scope",
    "data-lead-edit",
    "leadInlineActionsToggle",
    "leadInlineActionsBackdrop",
    "leadInlineDeleteBtn",
    "leadInlineSaveBtn",
    "leadModalClose",
    "leadModalSave",
    "leadConvertBtn",
    "data-lead-location-add",
    "data-lead-location-remove",
    "data-lead-location-pick",
    "data-lead-location-address"
  ]),
  leadForms: Object.freeze([
    "leadModalOverlay",
    "leadBusinessName",
    "leadCustomerType",
    "leadBillingCycle",
    "leadCountry",
    "leadContactName",
    "leadPhone",
    "leadInstagram",
    "leadEmail",
    "leadPassword",
    "leadCity",
    "leadAddress",
    "leadLogoTrigger",
    "leadLogoInput",
    "leadLogoPreview",
    "leadLogoUrl",
    "leadBestSpotLogoTrigger",
    "leadBestSpotLogoInput",
    "leadBestSpotLogoPreview",
    "leadBestSpotLogoUrl",
    "leadStatus",
    "leadNote",
    "leadMonthlyPrice",
    "leadPriceValue",
    "leadPrice_{type}",
    "leadCoordsDisplay",
    "leadLocationCoords_{index}"
  ]),
  customerActions: Object.freeze([
    "customersSearchInput",
    "data-customer-scope",
    "data-customer-edit",
    "customerModalOverlay",
    "customerModalClose",
    "customerModalSave",
    "customerLogoTrigger",
    "customerLogoInput",
    "customerLogoPreview",
    "customerLogoUrl"
  ]),
  customerForms: Object.freeze([
    "customerName",
    "customerOwnerName",
    "customerOwnerEmail",
    "customerPhone",
    "customerInstagram",
    "customerCity",
    "customerAddress",
    "customerStatus"
  ]),
  staffActions: Object.freeze([
    "data-staff-back",
    "staffNewBtn",
    "data-staff-edit",
    "staffAvatarTrigger",
    "staffAvatarInput",
    "staffAvatarPreview",
    "staffLocationPickBtn",
    "staffSaveBtn",
    "staffDeleteBtn"
  ]),
  staffForms: Object.freeze([
    "staffFirstName",
    "staffLastName",
    "staffEmail",
    "staffPassword",
    "staffCountry",
    "staffLocationLabel"
  ]),
  businessAccountActions: Object.freeze([
    "businessAccountNewBtn",
    "data-business-account-edit",
    "data-business-account-back",
    "businessAccountSaveBtn",
    "businessAccountToggleStatusBtn"
  ]),
  businessAccountForms: Object.freeze([
    "businessAccountFirstName",
    "businessAccountLastName",
    "businessAccountEmail",
    "businessAccountPassword",
    "businessAccountRole",
    "businessAccountBusinessAccess",
    "businessAccountWaiterAccess",
    "businessAccountActive"
  ]),
  geoMapActions: Object.freeze([
    "locationPickerModal",
    "pickerOverlay",
    "pickerPanel",
    "pickerMap",
    "closeLocationPickerBtn",
    "confirmLocationBtn"
  ]),
  eventHandlerGroups: Object.freeze([
    "bindCrmStaffEventsCore",
    "bindLeadInlineCreateEventsCore",
    "bindLeadOverlayEventsCore",
    "bindCustomerOverlayEventsCore",
    "bindBusinessAccountsEvents",
    "bindLocationPickerEvents",
    "ensureTabDataCore activeTab loaders"
  ]),
  ownershipRules: Object.freeze([
    "activeTab remains social-app-owned in this step",
    "route ownership remains social-app-owned in this step",
    "modal DOM ids must remain stable through migration",
    "event binding must move with matching route/render ownership, not before"
  ])
});

export const CRM_ADMIN_MIGRATION_ORDER = Object.freeze([
  "1. Keep this contract-only facade inventory with no behavior wiring.",
  "2. Extract CRM read/load facade for leads, customers, and staff behind this contract while social routes remain active.",
  "3. Move lead/customer/staff render and event ownership behind the facade with identical DOM ids.",
  "4. Move lead save/delete after read/load and event parity are proven.",
  "5. Move lead-to-customer conversion as its own step.",
  "6. Move customer write/update/status handling.",
  "7. Move CEO staff write/delete and geo dependencies.",
  "8. Decide business account ownership before moving business-owner scoped staff management.",
  "9. Move route ownership for CRM/Admin routes only after Heart/Admin can load them independently.",
  "10. Remove remaining normal social startup CRM imports only after route ownership is confirmed."
]);

export const CRM_ADMIN_DO_NOT_TOUCH_V1_SURFACES = Object.freeze([
  "feed",
  "search",
  "map",
  "public profile",
  "public menu",
  "QR menu",
  "cart",
  "orders",
  "chat disabled behavior",
  "normal social V1 visible UI",
  "public route behavior",
  "Heart UI/runtime before the explicit Heart/Admin integration step"
]);

export const CRM_ADMIN_FACADE_CONTRACT = Object.freeze({
  version: CRM_ADMIN_FACADE_CONTRACT_VERSION,
  domains: CRM_ADMIN_DOMAINS,
  requiredFunctions: CRM_ADMIN_REQUIRED_FUNCTIONS,
  requiredStateKeys: CRM_ADMIN_REQUIRED_STATE_KEYS,
  requiredFirebasePaths: CRM_ADMIN_REQUIRED_FIREBASE_PATHS,
  requiredUiActions: CRM_ADMIN_REQUIRED_UI_ACTIONS,
  migrationOrder: CRM_ADMIN_MIGRATION_ORDER,
  doNotTouchV1Surfaces: CRM_ADMIN_DO_NOT_TOUCH_V1_SURFACES
});

export function assertCrmAdminFacadeContractShape(contract = CRM_ADMIN_FACADE_CONTRACT) {
  const requiredTopLevelKeys = [
    "version",
    "domains",
    "requiredFunctions",
    "requiredStateKeys",
    "requiredFirebasePaths",
    "requiredUiActions",
    "migrationOrder",
    "doNotTouchV1Surfaces"
  ];
  const missing = requiredTopLevelKeys.filter((key) => !Object.prototype.hasOwnProperty.call(contract || {}, key));
  if (missing.length) {
    throw new Error(`Invalid CRM admin facade contract: missing ${missing.join(", ")}`);
  }
  return true;
}
