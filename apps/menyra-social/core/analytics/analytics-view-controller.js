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

// Der zuletzt gezeigte Stand, damit ein zweites Oeffnen nicht wieder auf das
// Netz wartet.
//
// Ein Schluessel pro Lokal, darin ein kurzes Verzeichnis: jeder Eintrag traegt
// die Signatur des Zeitraums bei sich und passt damit nur zu genau der Frage,
// die er beantwortet hat (anderer Zeitraum oder neuer Tag = andere Signatur =
// Fehlschlag). Mehrere Eintraege, damit auch das Hin und Her zwischen "7 dite"
// und "30 dite" ohne Warten geht - aber gedeckelt, damit der Speicher nicht
// mit jedem Tag weiterwaechst.
const ANALYTICS_CACHE_PREFIX = "menyra_social_analytics_cache_v1::";
const ANALYTICS_CACHE_MAX_ENTRIES = 3;

export function createAnalyticsViewController({
  state,
  renderFn,
  documentObj,
  storageObj,
  firestoreApi = {}
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const render = typeof renderFn === "function" ? renderFn : () => {};
  const storage = storageObj || (typeof localStorage === "undefined" ? null : localStorage);
  let loadSeq = 0;
  let delegationBound = false;

  function cacheKey(restaurantId = "") {
    return `${ANALYTICS_CACHE_PREFIX}${restaurantId}`;
  }

  function readCacheEntries(restaurantId = "") {
    if (!storage || !restaurantId) return [];
    try {
      const parsed = JSON.parse(storage.getItem(cacheKey(restaurantId)) || "null");
      const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
      return entries.filter((entry) => (
        entry
        && typeof entry === "object"
        && String(entry.signature || "").trim()
        && entry.model
        && typeof entry.model === "object"
      ));
    } catch {
      return [];
    }
  }

  function readCachedModel(restaurantId = "", signature = "") {
    if (!signature) return null;
    const hit = readCacheEntries(restaurantId).find((entry) => String(entry.signature) === signature);
    return hit ? hit.model : null;
  }

  function writeCachedModel(restaurantId = "", signature = "", model = null) {
    if (!storage || !restaurantId || !signature || !model) return;
    const next = [
      { signature, model },
      ...readCacheEntries(restaurantId).filter((entry) => String(entry.signature) !== signature)
    ].slice(0, ANALYTICS_CACHE_MAX_ENTRIES);
    try {
      storage.setItem(cacheKey(restaurantId), JSON.stringify({ entries: next }));
    } catch {
      // Kein Platz mehr: lieber der neueste Stand allein als gar keiner. Geht
      // auch das nicht, laeuft die Analitika weiter - nur eben ohne Gedaechtnis.
      try {
        storage.setItem(cacheKey(restaurantId), JSON.stringify({ entries: [{ signature, model }] }));
      } catch {}
    }
  }

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

  // silent: das Panel waermt im Hintergrund vor, waehrend der Nutzer auf
  // Funksionet steht. Dort ist von der Analitika nichts zu sehen, also gibt es
  // auch nichts anzuzeigen - der Zwischenschritt "laedt gerade" spart sich
  // einen ganzen Neuaufbau der App. Der Abschluss zeichnet weiterhin IMMER:
  // sonst bliebe ein Umriss stehen, wenn jemand waehrenddessen umschaltet.
  async function loadAnalytics({ force = false, silent = false } = {}) {
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
      if (!silent) render();
      return;
    }
    const signature = rangeSignature(range, restaurantId);
    if (!force && view.loadedRangeSignature === signature && view.status === "ready") return;

    // Erst der letzte Stand, dann das Netz - dasselbe Vorgehen wie im Panel.
    // Passt der gespeicherte Stand zu genau dieser Frage, steht die Analitika
    // sofort da und frischt sich still auf. Vorher wartete jedes Oeffnen auf
    // zwei Abfragen, auch wenn sich seit dem letzten Mal nichts geaendert
    // hatte - das war das lange Laden.
    // Gefragt wird nach der Signatur, nicht danach, ob ueberhaupt etwas
    // dasteht: nach einem Wechsel des Zeitraums steht noch der vorige Stand da,
    // und der ist fuer diese Frage keine Antwort.
    if (view.loadedRangeSignature !== signature) {
      const cached = readCachedModel(restaurantId, signature);
      if (cached) {
        view.model = cached;
        view.loadedRangeSignature = signature;
        view.status = "ready";
        if (!silent) render();
      }
    }

    loadSeq += 1;
    const seq = loadSeq;
    // Steht schon etwas da, bleibt es stehen: der Umriss wuerde einen fertigen
    // Stand gegen eine leere Flaeche tauschen.
    const hadModel = !!view.model;
    if (!hadModel) {
      view.status = "loading";
      view.error = "";
      if (!silent) render();
    }
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
      writeCachedModel(restaurantId, signature, view.model);
    } catch (err) {
      if (seq !== loadSeq) return;
      console.error("[mnyra][analytics] dashboard load failed", err);
      // Mit stehendem Stand ist ein fehlgeschlagenes Auffrischen kein Grund,
      // ihn wegzuwerfen - der Nutzer haette sonst statt gueltiger Zahlen eine
      // Fehlermeldung vor sich.
      if (!hadModel) {
        view.status = "error";
        view.error = "Analitika nuk mund te ngarkohej.";
      }
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
        // Gefragt wird nach der Ansicht, nicht nach dem Tab: die Analitika
        // steht auch als Seite im Bento des Panels, wo activeTab "dashboard"
        // ist. Eine Pruefung auf den Tab-Namen haette dort jeden Klick auf den
        // Zeitraum-Filter verschluckt. Der Rahmen [data-analytics-root] ist
        // dagegen genau das, was diese Handler bedienen - egal wer ihn traegt.
        if (!event.target?.closest?.("[data-analytics-root]")) return;
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
