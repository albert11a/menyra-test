import { createCrmRuntimeCluster } from "./crm-runtime-cluster.js";

export function createCrmDomainRuntimeCluster({
  stateDeps = {},
  constants = {},
  renderApi = {},
  leadApi = {},
  geoApi = {},
  firebaseApi = {},
  authApi = {},
  cacheApi = {},
  ceoApi = {},
  modalApi = {}
} = {}) {
  const crmRuntimeController = createCrmRuntimeCluster({
    stateDeps,
    constants,
    renderApi: {
      icon: renderApi.icon,
      escapeHtml: renderApi.escapeHtml,
      render: renderApi.render,
      renderOverlays: renderApi.renderOverlays,
      renderCrmLazyLoadingView: renderApi.renderCrmLazyLoadingView,
      renderCeoGuardCore: renderApi.renderCeoGuardCore,
      renderCeoScopeTabs: ceoApi.renderCeoScopeTabs,
      renderOwnershipPills: ceoApi.renderOwnershipPills,
      getOptimizedImageUrl: renderApi.getOptimizedImageUrl,
      isPlaceholderUrl: renderApi.isPlaceholderUrl,
      ensureLeafletLoaded: renderApi.ensureLeafletLoaded,
      alert: renderApi.alert,
      confirm: renderApi.confirm
    },
    leadApi,
    geoApi,
    firebaseApi,
    authApi,
    cacheApi,
    ceoApi,
    modalApi
  });

  return {
    crmRuntimeController,
    ...crmRuntimeController
  };
}
