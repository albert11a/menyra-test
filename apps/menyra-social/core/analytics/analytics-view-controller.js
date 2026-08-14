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
        // Das Lokal, zu dem der Zustand gehoert - siehe unten.
        restaurantId: "",
        model: null
      };
    }
    return state.analyticsView;
  }

  // Derselbe Schnitt wie im Panel: der Zustand gehoert zu genau EINEM Lokal.
  // Ohne ihn stand nach einem Kontowechsel die Analyse des vorigen Lokals da,
  // und es kam auch kein Neuladen in Gang - der Status stand ja auf "ready".
  // Die Zeitraum-Wahl bleibt stehen: sie gehoert dem Benutzer, nicht dem Lokal.
  function ensureViewStateForRestaurant(restaurantId = "") {
    const view = ensureViewState();
    const current = String(restaurantId || "").trim();
    if (String(view.restaurantId || "") === current) return view;
    view.restaurantId = current;
    view.model = null;
    view.status = "idle";
    view.error = "";
    view.loadedRangeSignature = "";
    // Eine laufende Antwort des vorigen Lokals darf nicht mehr ankommen.
    loadSeq += 1;
    return view;
  }

  function resolveOwnRestaurantId() {
    const profile = state?.userProfile || {};
    return String(profile.restaurantId || profile.staffRestaurantId || "").trim();
  }

  function rangeSignature(range, restaurantId) {
    return `${restaurantId}::${range.fromDay}::${range.toDay}`;
  }

  async function loadAnalytics({ force = false } = {}) {
    const restaurantId = resolveOwnRestaurantId();
    const view = ensureViewStateForRestaurant(restaurantId);
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
      view.error = "Ju lutem zgjidhni nje periudhe te vlefshme (data e fillimit para dates se mbarimit).";
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
      view.error = "Analitika nuk mund te ngarkohej.";
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
    const restaurantId = resolveOwnRestaurantId();
    // Vor dem ersten Blick auf den Zustand: gehoert er noch zu diesem Lokal?
    const view = ensureViewStateForRestaurant(restaurantId);

    let body = "";
    if (!restaurantId) {
      body = renderAnalyticsEmptyState({
        title: "Nuk ka profil biznesi te lidhur",
        body: "Analitika eshte e disponueshme vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant ose dyqan, statistikat e tua shfaqen ketu."
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
          <p class="text-xs" style="color:var(--an-muted); margin-top:2px;">Shtrirja jote, performanca e menuse dhe porosite me nje shikim.</p>
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
