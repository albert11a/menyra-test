// Business-Dashboard-Tab (Mnyra Menu).
// Ein Business sieht alle eigenen Funktionen an einer Stelle: Identitaet,
// Schnellaktionen (typ-abhaengig: Restaurant/Hotel/Shop), 7-Tage-Kennzahlen
// und die letzten Beitraege.
//
// Ladeweg (bewusst ohne Zwischenzustands-Flackern):
// 1. Kopf + Schnellaktionen rendern sofort aus bereits vorhandenem State.
// 2. Kennzahlen/Beitraege: erst localStorage-Cache (gleicher Tag) -> sofort
//    sichtbar, dann stiller Hintergrund-Refresh; ohne Cache ein Skeleton mit
//    identischer Geometrie. Ein fehlgeschlagener stiller Refresh laesst die
//    zuletzt gueltigen Daten stehen.

import { resolveAnalyticsRange, summarizeAnalyticsDays } from "../analytics/analytics-dashboard-core.js";
import { loadAnalyticsDailyRange } from "../analytics/analytics-daily-loader.js";
import {
  ensureDashboardStylesInjected,
  resolveDashboardKindCore,
  buildDashboardQuickActionsCore,
  buildDashboardKpiDefsCore,
  renderDashboardGreeting,
  renderDashboardGreetingSkeleton,
  renderDashboardComposerCard,
  renderDashboardQuickActions,
  renderDashboardKpis,
  renderDashboardRecentPosts,
  renderDashboardDataSkeleton,
  renderDashboardErrorState,
  renderDashboardNoBusinessState
} from "./dashboard-render-utils.js";

const DASHBOARD_CACHE_PREFIX = "menyra_social_dashboard_cache_v1::";
const RECENT_POSTS_FETCH_LIMIT = 6;
const RECENT_POSTS_SHOW_LIMIT = 3;

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPostDate(raw = {}) {
  const clientIso = String(raw.createdAtClient || "").trim();
  if (clientIso) {
    const parsed = new Date(clientIso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const created = raw.createdAt;
  if (created && typeof created.toDate === "function") {
    try {
      const parsed = created.toDate();
      if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) return parsed;
    } catch {}
  }
  return null;
}

export function normalizeDashboardPostCore(id = "", raw = {}) {
  const media = Array.isArray(raw.media) && raw.media.length ? raw.media[0] : {};
  const mediaType = String(media.type || raw.mediaType || "image").trim().toLowerCase() === "video" ? "video" : "image";
  const thumbUrl = String(media.thumbUrl || (mediaType === "image" ? media.url : "") || raw.thumbUrl || "").trim();
  const date = toPostDate(raw);
  return {
    id: String(id || "").trim(),
    caption: String(raw.caption || "").trim(),
    mediaType,
    thumbUrl,
    likesCount: num(raw.likesCount),
    commentsCount: num(raw.commentsCount),
    impressions: 0,
    dateLabel: date
      ? date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
      : "",
    createdAtMs: date ? date.getTime() : 0
  };
}

// Pur + getestet: baut das Dashboard-Datenmodell aus analyticsDaily-Docs
// und den zuletzt geladenen Business-Posts.
export function buildDashboardModelCore({ days = [], todayKey = "", rawPosts = [] } = {}) {
  const safeDays = Array.isArray(days) ? days : [];
  const weekAgg = summarizeAnalyticsDays(safeDays);
  const todayDoc = safeDays.find((docData) => String(docData?.date || docData?.id || "").trim() === String(todayKey || "").trim());
  const todayAgg = summarizeAnalyticsDays(todayDoc ? [todayDoc] : []);
  const postStats = weekAgg.merged?.posts && typeof weekAgg.merged.posts === "object" ? weekAgg.merged.posts : {};
  const posts = (Array.isArray(rawPosts) ? rawPosts : [])
    .map((entry) => normalizeDashboardPostCore(entry?.id, entry?.data || {}))
    .filter((post) => post.id)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, RECENT_POSTS_SHOW_LIMIT)
    .map((post) => ({
      ...post,
      impressions: num(postStats[post.id]?.impressions)
    }));
  return {
    day: String(todayKey || "").trim(),
    week: weekAgg.summary,
    today: todayAgg.summary,
    posts
  };
}

export function createDashboardViewController({
  state,
  renderFn,
  documentObj,
  firestoreApi = {},
  profileApi = {},
  composerApi = {},
  iconFn,
  storageObj
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const render = typeof renderFn === "function" ? renderFn : () => {};
  const storage = storageObj || (typeof localStorage === "undefined" ? null : localStorage);
  const getBusinessProfileType = typeof profileApi.getBusinessProfileTypeFn === "function"
    ? profileApi.getBusinessProfileTypeFn
    : (() => "");
  const isShopCatalogProfile = typeof profileApi.isShopCatalogProfileFn === "function"
    ? profileApi.isShopCatalogProfileFn
    : (() => false);
  const isBusinessOwnerProfile = typeof profileApi.isBusinessOwnerProfileFn === "function"
    ? profileApi.isBusinessOwnerProfileFn
    : (() => false);
  const canAccessRestaurantOrders = typeof profileApi.canAccessRestaurantOrdersFn === "function"
    ? profileApi.canAccessRestaurantOrdersFn
    : (() => false);
  const getRestaurantMetaById = typeof profileApi.getRestaurantMetaByIdFn === "function"
    ? profileApi.getRestaurantMetaByIdFn
    : (() => null);
  const resolveRestaurantLogo = typeof profileApi.resolveRestaurantLogoFn === "function"
    ? profileApi.resolveRestaurantLogoFn
    : (() => "");
  const resolveOwnAvatarUrl = typeof profileApi.resolveOwnAvatarUrlFn === "function"
    ? profileApi.resolveOwnAvatarUrlFn
    : (() => "");
  let loadSeq = 0;
  let delegationBound = false;
  let composerController = null;
  let composerLoadPromise = null;
  let composerOpenIntent = "";
  // Wird beim Nachladen des Composers gesetzt (reine Normalisierung eines
  // menuItems-Dokuments fuer die Produkt-Auswahl).
  let normalizeComposerProductFn = () => null;
  const MENU_ITEMS_LIMIT = 300;

  async function loadComposerProducts(restaurantId = "") {
    const { db, collectionFn, queryFn, limitFn, getDocsFn } = firestoreApi;
    const rid = String(restaurantId || "").trim();
    if (
      !rid
      || !db
      || typeof collectionFn !== "function"
      || typeof getDocsFn !== "function"
    ) {
      throw new Error("Produktet nuk u ngarkuan.");
    }
    const itemsRef = collectionFn(db, "restaurants", rid, "menuItems");
    const itemsQuery = (typeof queryFn === "function" && typeof limitFn === "function")
      ? queryFn(itemsRef, limitFn(MENU_ITEMS_LIMIT))
      : itemsRef;
    const snap = await getDocsFn(itemsQuery);
    const items = [];
    snap.forEach((docSnap) => {
      const normalized = normalizeComposerProductFn(docSnap?.id, docSnap?.data?.() || {});
      if (normalized) items.push(normalized);
    });
    // Speisen und Getraenke gemeinsam, alphabetisch - so findet man ein
    // Produkt im Popup ohne Nachdenken.
    items.sort((a, b) => a.name.localeCompare(b.name, "sq"));
    return items;
  }

  // Der Composer wird erst beim ersten Klick geladen (eigener Chunk): der
  // Dashboard-Start bleibt damit unveraendert leicht.
  function ensureComposerLoaded() {
    if (composerController) return Promise.resolve(composerController);
    if (!composerLoadPromise) {
      composerLoadPromise = import("../composer/business-composer-controller.js")
        .then((module) => {
          normalizeComposerProductFn = typeof module?.normalizeComposerProductCore === "function"
            ? module.normalizeComposerProductCore
            : (() => null);
          composerController = module.createBusinessComposerController({
            documentObj: doc,
            windowObj: doc?.defaultView || null,
            api: {
              getRestaurantIdFn: () => resolveOwnRestaurantId(),
              getBusinessMetaFn: () => {
                const restaurantId = resolveOwnRestaurantId();
                if (!restaurantId) return { name: "", logoUrl: "" };
                const hero = resolveHeroData(restaurantId);
                return { name: hero.name, logoUrl: hero.logoUrl };
              },
              loadProductsFn: (rid) => loadComposerProducts(rid),
              uploadImageFn: composerApi.uploadImageFn,
              createPostFn: composerApi.createPostFn,
              createStoryFn: composerApi.createStoryFn,
              formatPriceFn: composerApi.formatPriceFn,
              getOptimizedImageUrlFn: composerApi.getOptimizedImageUrlFn,
              afterPublishFn: async (publishedMode) => {
                // Dashboard zuerst auffrischen (die Karte "Letzte Beitraege"
                // steht direkt darunter), Feed/Stories danach im Hintergrund.
                try {
                  await loadDashboard({ force: true });
                } catch {}
                if (typeof composerApi.afterPublishFn === "function") {
                  await composerApi.afterPublishFn(publishedMode);
                }
              }
            }
          });
          return composerController;
        })
        .catch((err) => {
          composerLoadPromise = null;
          console.error("[mnyra][dashboard] composer load failed", err);
          throw err;
        });
    }
    return composerLoadPromise;
  }

  function openComposer(nextMode = "post") {
    const normalized = String(nextMode || "").trim().toLowerCase() === "story" ? "story" : "post";
    // Upload-Runtime schon beim Oeffnen anwerfen (laeuft parallel zum
    // Composer-Chunk): auf 3G wartet der "Posto"-Klick spaeter nicht darauf.
    if (typeof composerApi.prewarmFn === "function") {
      try {
        composerApi.prewarmFn();
      } catch {}
    }
    if (composerController) {
      composerController.open(normalized);
      return;
    }
    // Doppel-Taps waehrend des Nachladens starten keinen zweiten Import und
    // oeffnen am Ende genau ein Modal.
    composerOpenIntent = normalized;
    void ensureComposerLoaded()
      .then((controller) => {
        const intent = composerOpenIntent || normalized;
        composerOpenIntent = "";
        controller?.open?.(intent);
      })
      .catch(() => {
        composerOpenIntent = "";
      });
  }

  function ensureViewState() {
    if (!state.dashboardView || typeof state.dashboardView !== "object") {
      state.dashboardView = {
        status: "idle", // idle | loading | ready | error
        error: "",
        model: null,
        loadedSignature: ""
      };
    }
    return state.dashboardView;
  }

  function resolveOwnRestaurantId() {
    const profile = state?.userProfile || {};
    return String(profile.restaurantId || profile.staffRestaurantId || "").trim();
  }

  // Gleiches Muster wie der Menue-Editor: solange Auth-Bootstrap/Profil-Load
  // laufen, ist eine fehlende restaurantId kein "kein Business", sondern
  // "noch am Aufloesen" -> Skeleton statt falscher Leerzustand.
  function isResolvingBusinessProfile() {
    const activeUid = String(state?.user?.uid || "").trim();
    if (!activeUid) return false;
    const bootstrapInFlightUid = String(state?.__authBootstrapInFlightUid || "").trim();
    return !!state?.__authProfileLoadPromise || bootstrapInFlightUid === activeUid;
  }

  function cacheKey(restaurantId = "") {
    return `${DASHBOARD_CACHE_PREFIX}${restaurantId}`;
  }

  function readCachedModel(restaurantId = "", todayKey = "") {
    if (!storage || !restaurantId) return null;
    try {
      const raw = storage.getItem(cacheKey(restaurantId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (String(parsed.day || "").trim() !== String(todayKey || "").trim()) return null;
      if (!parsed.model || typeof parsed.model !== "object") return null;
      return parsed.model;
    } catch {
      return null;
    }
  }

  function writeCachedModel(restaurantId = "", model = null) {
    if (!storage || !restaurantId || !model) return;
    try {
      storage.setItem(cacheKey(restaurantId), JSON.stringify({ day: model.day, model }));
    } catch {}
  }

  async function loadRecentPosts(restaurantId = "") {
    const { db, collectionFn, queryFn, orderByFn, limitFn, getDocsFn } = firestoreApi;
    if (
      !db
      || typeof collectionFn !== "function"
      || typeof queryFn !== "function"
      || typeof orderByFn !== "function"
      || typeof limitFn !== "function"
      || typeof getDocsFn !== "function"
    ) {
      return [];
    }
    const postsRef = collectionFn(db, "restaurants", restaurantId, "socialPosts");
    const snap = await getDocsFn(queryFn(
      postsRef,
      orderByFn("createdAt", "desc"),
      limitFn(RECENT_POSTS_FETCH_LIMIT)
    ));
    return snap.docs
      .map((docSnap) => ({ id: docSnap.id, data: docSnap.data() || {} }))
      .filter((entry) => {
        const status = String(entry.data.status || "active").trim().toLowerCase();
        return status !== "deleted" && status !== "hidden";
      });
  }

  async function loadDashboard({ force = false } = {}) {
    const view = ensureViewState();
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId) return;
    const range = resolveAnalyticsRange({ rangeKey: "7d" });
    if (!range) return;
    const signature = `${restaurantId}::${range.toDay}`;
    if (!force && view.loadedSignature === signature && view.status === "ready") return;

    // Cache zuerst: gleicher Tag -> sofort anzeigen, danach still auffrischen.
    if (!view.model) {
      const cached = readCachedModel(restaurantId, range.toDay);
      if (cached) {
        view.model = cached;
        view.status = "ready";
        render();
      }
    }

    loadSeq += 1;
    const seq = loadSeq;
    const hadModel = !!view.model;
    if (!hadModel) {
      view.status = "loading";
      view.error = "";
      render();
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
      const [daysResult, postsResult] = await Promise.allSettled([
        loadAnalyticsDailyRange({ ...loaderDeps, fromDay: range.fromDay, toDay: range.toDay }),
        loadRecentPosts(restaurantId)
      ]);
      if (seq !== loadSeq) return;
      if (daysResult.status === "rejected") throw daysResult.reason;
      if (postsResult.status === "rejected") {
        console.error("[mnyra][dashboard] recent posts load failed", postsResult.reason);
      }
      view.model = buildDashboardModelCore({
        days: daysResult.value,
        todayKey: range.toDay,
        rawPosts: postsResult.status === "fulfilled" ? postsResult.value : []
      });
      view.status = "ready";
      view.error = "";
      view.loadedSignature = signature;
      writeCachedModel(restaurantId, view.model);
    } catch (err) {
      if (seq !== loadSeq) return;
      console.error("[mnyra][dashboard] load failed", err);
      if (!view.model) {
        view.status = "error";
        view.error = "Ju lutem kontrollo lidhjen dhe provo perseri.";
      }
      // Mit vorhandenem Modell: stiller Refresh-Fehler, letzte Daten bleiben stehen.
    }
    render();
  }

  function bindDelegatedEvents() {
    if (delegationBound || !doc) return;
    delegationBound = true;
    doc.addEventListener("click", (event) => {
      try {
        if (String(state?.activeTab || "").trim().toLowerCase() !== "dashboard") return;
        if (event.target?.closest?.("[data-dashboard-retry]")) {
          void loadDashboard({ force: true });
          return;
        }
        const composerBtn = event.target?.closest?.("[data-dashboard-composer]");
        if (composerBtn) {
          event.preventDefault();
          openComposer(composerBtn.getAttribute("data-dashboard-composer"));
        }
      } catch {}
    });
  }

  function resolveHeroData(restaurantId = "") {
    const profile = state?.userProfile || {};
    const rest = restaurantId ? (getRestaurantMetaById(restaurantId) || {}) : {};
    const type = getBusinessProfileType(profile);
    const name = String(rest.name || rest.restaurantName || profile.name || "").trim() || "Business";
    // Erst die Shell-Kette (identisch zu Drawer/Header, inkl. Logo-Cache),
    // dann das Restaurant-Logo aus den Metadaten; nie rohe avatar-Werte.
    let logoUrl = "";
    try {
      logoUrl = String(resolveOwnAvatarUrl() || "").trim();
    } catch {}
    if (!logoUrl) {
      try {
        logoUrl = String(resolveRestaurantLogo(rest) || "").trim();
      } catch {}
    }
    return {
      name,
      logoUrl,
      kind: resolveDashboardKindCore({
        businessType: type,
        isShopCatalog: isShopCatalogProfile(profile)
      })
    };
  }

  function renderDashboardView() {
    ensureDashboardStylesInjected(doc);
    bindDelegatedEvents();
    const view = ensureViewState();
    const restaurantId = resolveOwnRestaurantId();

    let body = "";
    if (!restaurantId) {
      body = isResolvingBusinessProfile()
        ? `${renderDashboardGreetingSkeleton()}${renderDashboardDataSkeleton({ kpiCount: 6 })}`
        : renderDashboardNoBusinessState();
    } else {
      const hero = resolveHeroData(restaurantId);
      const actions = buildDashboardQuickActionsCore({
        kind: hero.kind,
        isOwner: isBusinessOwnerProfile(state?.userProfile),
        canAccessOrders: canAccessRestaurantOrders(state?.userProfile)
      });
      const kpiDefs = buildDashboardKpiDefsCore(hero.kind);

      if (view.status === "idle") {
        // Lazy-Load beim ersten Render des Tabs (gleiches Muster wie Analytics).
        view.status = "loading";
        queueMicrotask(() => {
          void loadDashboard({ force: false });
        });
      }

      let dataBody = "";
      if (view.model) {
        dataBody = `
          ${renderDashboardKpis({ kpiDefs, week: view.model.week, today: view.model.today })}
          ${renderDashboardRecentPosts({ posts: view.model.posts, iconFn })}
        `;
      } else if (view.status === "error") {
        dataBody = renderDashboardErrorState({ message: view.error });
      } else {
        dataBody = renderDashboardDataSkeleton({ kpiCount: kpiDefs.length });
      }

      body = `
        ${renderDashboardGreeting({ name: hero.name, logoUrl: hero.logoUrl, iconFn })}
        ${renderDashboardComposerCard({ iconFn })}
        ${renderDashboardQuickActions({ actions, iconFn })}
        ${dataBody}
      `;
    }

    return `
      <section class="mnyra-dash" data-dashboard-root>
        ${body}
      </section>
    `;
  }

  return Object.freeze({
    renderDashboardView,
    loadDashboard
  });
}
