import { renderMarketplaceSkeletonSectionCore } from "./marketplace-skeleton-markup.js";

const EMPTY_RENDER = () => "";

function asFn(candidate, fallback = EMPTY_RENDER) {
  return typeof candidate === "function" ? candidate : fallback;
}

function normalizeSectionKey(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (key === "restaurant") return "restaurants";
  if (key === "hotel" || key === "hotels" || key === "motel" || key === "motels") return "travel";
  if (key === "shop" || key === "ecommerce" || key === "e-commerce") return "shopping";
  return key;
}

export function createMarketplaceRuntimeBoundary({
  state = null,
  dataLoaded = null,
  renderFn = () => {},
  helperApi = {},
  profileApi = {}
} = {}) {
  const render = asFn(renderFn, () => {});
  let renderUtils = null;
  let renderUtilsPromise = null;

  function ensureRenderUtils() {
    if (renderUtils) return Promise.resolve(renderUtils);
    if (renderUtilsPromise) return renderUtilsPromise;
    renderUtilsPromise = import("./marketplace-view-render-utils.js")
      .then((module) => {
        renderUtils = module;
        render();
        return module;
      })
      .catch((err) => {
        renderUtilsPromise = null;
        throw err;
      });
    return renderUtilsPromise;
  }

  function queueRenderUtilsLoad() {
    void ensureRenderUtils().catch(() => null);
  }

  // Solange die Marktplatz-Ansicht noch nachgeladen wird, stehen hier die
  // grauen Umrisse der spaeteren Karten - kein Satz, der nichts ueber die Form
  // sagt. Dadurch springt beim Umschalten der Pills nichts.
  function renderLoadingView() {
    return renderMarketplaceSkeletonSectionCore();
  }

  function renderMarketplaceView(sectionKey = "") {
    const section = normalizeSectionKey(sectionKey);
    if (!renderUtils?.renderMarketplaceViewCore) {
      queueRenderUtilsLoad();
      return renderLoadingView();
    }
    return renderUtils.renderMarketplaceViewCore({
      state,
      dataLoaded,
      sectionKey: section,
      escapeHtmlFn: helperApi.escapeHtmlFn,
      iconFn: helperApi.iconFn,
      getOptimizedImageUrlFn: helperApi.getOptimizedImageUrlFn,
      isPlaceholderUrlFn: helperApi.isPlaceholderUrlFn,
      isImageReadyFn: helperApi.isImageReadyFn,
      placeholderImage: helperApi.placeholderImage,
      formatCountFn: helperApi.formatCountFn,
      renderMapViewFn: helperApi.renderMapViewFn,
      normalizeRestaurantTypeFn: profileApi.normalizeRestaurantTypeFn,
      normalizeLeadTypeKeyFn: profileApi.normalizeLeadTypeKeyFn,
      resolveRestaurantLogoFn: profileApi.resolveRestaurantLogoFn
    });
  }

  return Object.freeze({
    ensureRenderUtils,
    // Damit ein Tipp auf "Lokalet" oder "Ofertat" nicht erst das Nachladen
    // anstoesst, kann die Huelle den Baustein vorher warm halten.
    warmRenderUtils: queueRenderUtilsLoad,
    isRenderUtilsReady: () => !!renderUtils?.renderMarketplaceViewCore,
    renderMarketplaceView,
    renderRestaurantsView: () => renderMarketplaceView("restaurants"),
    renderTravelView: () => renderMarketplaceView("travel"),
    renderShoppingView: () => renderMarketplaceView("shopping")
  });
}
