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

  function renderLoadingView() {
    const icon = asFn(helperApi.iconFn, () => "");
    return `
      <section class="p-6 pb-24 animate-in fade-in duration-300">
        <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
          ${icon("loader-2", "w-4 h-4 animate-spin")}
          Daten werden vorbereitet ...
        </div>
      </section>
    `;
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
      placeholderImage: helperApi.placeholderImage,
      formatCountFn: helperApi.formatCountFn,
      normalizeRestaurantTypeFn: profileApi.normalizeRestaurantTypeFn,
      normalizeLeadTypeKeyFn: profileApi.normalizeLeadTypeKeyFn,
      resolveRestaurantLogoFn: profileApi.resolveRestaurantLogoFn
    });
  }

  return Object.freeze({
    ensureRenderUtils,
    renderMarketplaceView,
    renderRestaurantsView: () => renderMarketplaceView("restaurants"),
    renderTravelView: () => renderMarketplaceView("travel"),
    renderShoppingView: () => renderMarketplaceView("shopping")
  });
}
