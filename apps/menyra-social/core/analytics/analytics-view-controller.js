// Business-Analytics-Tab (Mnyra Menu).
// Ein Business sieht ausschliesslich die Analytics des eigenen Restaurants
// (state.userProfile.restaurantId). Laden erfolgt lazy beim ersten Render.

import { resolveAnalyticsRange, buildAnalyticsDashboardModel } from "./analytics-dashboard-core.js";
import { loadAnalyticsDailyRange } from "./analytics-daily-loader.js";
import {
  ensureAnalyticsStylesInjected,
  renderAnalyticsRangeFilter,
  renderAnalyticsDashboard,
  renderAnalyticsLoadingState,
  renderAnalyticsEmptyState,
  renderAnalyticsErrorState,
  bindAnalyticsChartInteractions
} from "./analytics-dashboard-render-utils.js";

export function createAnalyticsViewController({
  state,
  renderFn,
  documentObj,
  firestoreApi = {}
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const render = typeof renderFn === "function" ? renderFn : () => {};
  let loadSeq = 0;
  let delegationBound = false;

  function ensureViewState() {
    if (!state.analyticsView || typeof state.analyticsView !== "object") {
      state.analyticsView = {
        status: "idle", // idle | loading | ready | error | empty-business
        error: "",
        rangeKey: "7d",
        customFrom: "",
        customTo: "",
        loadedRangeSignature: "",
        model: null
      };
    }
    return state.analyticsView;
  }

  function resolveOwnRestaurantId() {
    const profile = state?.userProfile || {};
    return String(profile.restaurantId || profile.staffRestaurantId || "").trim();
  }

  function rangeSignature(range, restaurantId) {
    return `${restaurantId}::${range.fromDay}::${range.toDay}`;
  }

  async function loadAnalytics({ force = false } = {}) {
    const view = ensureViewState();
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId) {
      view.status = "empty-business";
      return;
    }
    const range = resolveAnalyticsRange({
      rangeKey: view.rangeKey,
      customFrom: view.customFrom,
      customTo: view.customTo
    });
    if (!range) {
      view.status = "error";
      view.error = "Bitte einen gültigen Zeitraum wählen (Von-Datum vor Bis-Datum).";
      render();
      return;
    }
    const signature = rangeSignature(range, restaurantId);
    if (!force && view.loadedRangeSignature === signature && view.status === "ready") return;
    loadSeq += 1;
    const seq = loadSeq;
    view.status = "loading";
    view.error = "";
    render();
    try {
      const loaderDeps = {
        db: firestoreApi.db,
        collectionFn: firestoreApi.collectionFn,
        queryFn: firestoreApi.queryFn,
        whereFn: firestoreApi.whereFn,
        documentIdFn: firestoreApi.documentIdFn,
        getDocsFn: firestoreApi.getDocsFn,
        restaurantId
      };
      const [currentDays, previousDays] = await Promise.all([
        loadAnalyticsDailyRange({ ...loaderDeps, fromDay: range.fromDay, toDay: range.toDay }),
        loadAnalyticsDailyRange({ ...loaderDeps, fromDay: range.prevFromDay, toDay: range.prevToDay })
      ]);
      if (seq !== loadSeq) return;
      view.model = buildAnalyticsDashboardModel({ range, currentDays, previousDays });
      view.loadedRangeSignature = signature;
      view.status = "ready";
    } catch (err) {
      if (seq !== loadSeq) return;
      console.error("[mnyra][analytics] dashboard load failed", err);
      view.status = "error";
      view.error = "Analytics konnten nicht geladen werden.";
    }
    render();
  }

  function setRange(rangeKey = "7d") {
    const view = ensureViewState();
    view.rangeKey = String(rangeKey || "7d").trim() || "7d";
    if (view.rangeKey !== "custom") {
      void loadAnalytics({ force: false });
    }
    render();
  }

  function applyCustomRange() {
    const view = ensureViewState();
    const fromInput = doc?.querySelector?.("[data-analytics-custom-from]");
    const toInput = doc?.querySelector?.("[data-analytics-custom-to]");
    view.customFrom = String(fromInput?.value || view.customFrom || "").trim();
    view.customTo = String(toInput?.value || view.customTo || "").trim();
    void loadAnalytics({ force: true });
  }

  function bindDelegatedEvents() {
    if (delegationBound || !doc) return;
    delegationBound = true;
    doc.addEventListener("click", (event) => {
      try {
        if (String(state?.activeTab || "").trim().toLowerCase() !== "analytics") return;
        const rangeBtn = event.target?.closest?.("[data-analytics-range]");
        if (rangeBtn) {
          setRange(rangeBtn.getAttribute("data-analytics-range"));
          return;
        }
        if (event.target?.closest?.("[data-analytics-custom-apply]")) {
          applyCustomRange();
          return;
        }
        if (event.target?.closest?.("[data-analytics-retry]")) {
          void loadAnalytics({ force: true });
        }
      } catch {}
    });
  }

  function scheduleAfterRenderBind() {
    if (!doc) return;
    const win = doc.defaultView || (typeof window === "undefined" ? null : window);
    const raf = win?.requestAnimationFrame || ((fn) => setTimeout(fn, 0));
    raf(() => {
      try {
        bindAnalyticsChartInteractions(doc);
      } catch {}
    });
  }

  function renderAnalyticsView() {
    ensureAnalyticsStylesInjected(doc);
    bindDelegatedEvents();
    const view = ensureViewState();
    const restaurantId = resolveOwnRestaurantId();

    let body = "";
    if (!restaurantId) {
      body = renderAnalyticsEmptyState({
        title: "Kein Business-Profil verbunden",
        body: "Analytics sind nur für Business-Konten verfügbar. Sobald dein Konto mit einem Restaurant oder Shop verbunden ist, erscheinen hier deine Statistiken."
      });
    } else if (view.status === "idle" || (view.status === "loading" && !view.model)) {
      if (view.status === "idle") {
        // Lazy-Load beim ersten Render des Tabs.
        queueMicrotask(() => {
          void loadAnalytics({ force: false });
        });
        view.status = "loading";
      }
      body = renderAnalyticsLoadingState();
    } else if (view.status === "error") {
      body = renderAnalyticsErrorState({ message: view.error });
    } else {
      // ready (oder loading mit altem Modell: Frame halten, reduziert deckend)
      const dashboard = renderAnalyticsDashboard(view.model);
      body = view.status === "loading"
        ? `<div style="opacity:0.55; pointer-events:none;">${dashboard}</div>`
        : dashboard;
    }

    scheduleAfterRenderBind();

    return `
      <section class="p-4 pb-28 mnyra-an" data-analytics-root>
        <div class="mb-4">
          <h2 class="text-lg font-black tracking-tight text-slate-900" style="color:var(--an-ink);">Analytics</h2>
          <p class="text-xs" style="color:var(--an-muted); margin-top:2px;">Deine Reichweite, Menü-Performance und Bestellungen auf einen Blick.</p>
        </div>
        ${renderAnalyticsRangeFilter({
          rangeKey: view.rangeKey,
          customFrom: view.customFrom,
          customTo: view.customTo
        })}
        ${body}
      </section>
    `;
  }

  return Object.freeze({
    renderAnalyticsView,
    loadAnalytics,
    setRange
  });
}
