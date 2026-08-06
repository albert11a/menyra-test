// Mnyra Ofertat - View-Controller.
//
// Buendelt beide Oberflaechen:
//  - Kundentab "Ofertat" (Header-Tab neben Feed/Restorante)
//  - Business-Tab "Ofertat" (Drawer-Eintrag, Editor + Analytics)
//
// Events laufen ueber genau einen delegierten Listener am Dokument, damit sie
// jeden Re-Render der Shell ueberleben. Der Sekundentakt aktualisiert nur die
// Countdown-Knoten direkt im DOM - ein Full-Render pro Sekunde waere auf
// Mobilgeraeten zu teuer und wuerde Scrollpositionen kosten.

import {
  normalizeVoucherItem,
  resolveVoucherWindow,
  resolveActivationState,
  formatActivationCountdown,
  formatVoucherRemaining,
  resolveVoucherUrgency,
  buildVoucherActivationKey,
  validateVoucherDraft,
  fromVoucherInputValue,
  clampActivationMinutes,
  createVoucherId,
  cleanVoucherText,
  VOUCHER_DEFAULT_ACTIVATION_MINUTES,
  VOUCHER_DEFAULT_RUNTIME_DAYS
} from "./voucher-core.js";
import {
  renderVoucherCard,
  renderVoucherConfirmModal,
  renderVoucherFeedEmptyState,
  renderVoucherFeedLoadingState,
  renderVoucherLocationGate
} from "./voucher-customer-render-utils.js";
import {
  renderVoucherAdminBody,
  renderVoucherAdminNoBusinessState,
  renderVoucherEditor
} from "./voucher-admin-render-utils.js";

const COUNTDOWN_TICK_MS = 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const URGENCY_BADGE_STYLE = Object.freeze({
  critical: "rgba(225,29,72,0.92)",
  soon: "rgba(217,119,6,0.92)",
  calm: "rgba(15,23,42,0.9)",
  none: "rgba(15,23,42,0.9)"
});

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

export function createVoucherViewController({
  state = null,
  runtime = null,
  renderFn = () => {},
  documentObj = null,
  windowObj = null,
  helperApi = {},
  profileApi = {},
  confirmFn = null,
  alertFn = null
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const render = asFn(renderFn, () => {});
  const escapeHtml = asFn(helperApi.escapeHtmlFn, (value = "") => String(value ?? ""));
  const icon = asFn(helperApi.iconFn, () => "");
  const getOptimizedImageUrl = asFn(helperApi.getOptimizedImageUrlFn, (value = "") => value);
  const isPlaceholderUrl = asFn(helperApi.isPlaceholderUrlFn, () => false);
  const placeholderImage = helperApi.placeholderImage || "";
  const resolveRestaurantLogo = asFn(profileApi.resolveRestaurantLogoFn, () => "");
  const normalizeRestaurantType = asFn(profileApi.normalizeRestaurantTypeFn, () => "");
  const normalizeLeadTypeKey = asFn(profileApi.normalizeLeadTypeKeyFn, () => "");
  const getRestaurantMetaById = asFn(profileApi.getRestaurantMetaByIdFn, () => null);
  const isBusinessOffersProfile = asFn(profileApi.isBusinessOffersProfileFn, () => false);
  const confirmDialog = asFn(confirmFn, () => true);
  const alertDialog = asFn(alertFn, () => {});

  const renderDeps = {
    escapeHtml,
    icon,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    placeholderImage,
    resolveRestaurantLogo,
    normalizeRestaurantType,
    normalizeLeadTypeKey
  };

  let delegationBound = false;
  let tickHandle = 0;
  let marketplaceModule = null;
  let marketplaceModulePromise = null;
  let pendingImageFile = null;
  let lastImpressionSignature = "";

  function view() {
    return runtime?.ensureState?.() || null;
  }

  function ensureMarketplaceModule() {
    if (marketplaceModule) return Promise.resolve(marketplaceModule);
    if (marketplaceModulePromise) return marketplaceModulePromise;
    marketplaceModulePromise = import("../marketplace/marketplace-view-render-utils.js")
      .then((module) => {
        marketplaceModule = module;
        render();
        return module;
      })
      .catch((err) => {
        marketplaceModulePromise = null;
        throw err;
      });
    return marketplaceModulePromise;
  }

  function resolveScope() {
    if (!marketplaceModule?.collectVoucherScopeBusinessesCore) {
      void ensureMarketplaceModule().catch(() => null);
      return null;
    }
    return marketplaceModule.collectVoucherScopeBusinessesCore(state, renderDeps);
  }

  function resolveOwnRestaurantId() {
    const profile = state?.userProfile || {};
    return cleanVoucherText(profile.restaurantId || profile.staffRestaurantId || state?.roleSwitchRestaurantId);
  }

  // Solange Auth-Bootstrap laeuft, ist eine fehlende restaurantId "noch nicht
  // aufgeloest" und kein "kein Business" - gleiche Regel wie im Menue-Editor.
  function isResolvingBusinessProfile() {
    const activeUid = cleanVoucherText(state?.user?.uid);
    if (!activeUid) return false;
    return !!state?.__authProfileLoadPromise
      || cleanVoucherText(state?.__authBootstrapInFlightUid) === activeUid;
  }

  // ------------------------------------------------------------- Kundentab

  function collectVisibleVouchers(nowMs = Date.now()) {
    const current = view();
    if (!current) return [];
    const rows = [];
    (Array.isArray(current.feed.entries) ? current.feed.entries : []).forEach((entry) => {
      const business = entry?.business || {};
      (Array.isArray(entry?.items) ? entry.items : []).forEach((rawItem) => {
        const item = normalizeVoucherItem(rawItem);
        if (resolveVoucherWindow(item, nowMs).status !== "live") return;
        rows.push({ business, item });
      });
    });
    return rows.sort((a, b) => {
      const aWindow = resolveVoucherWindow(a.item, nowMs);
      const bWindow = resolveVoucherWindow(b.item, nowMs);
      const aEnd = aWindow.endMs || Number.MAX_SAFE_INTEGER;
      const bEnd = bWindow.endMs || Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    });
  }

  function renderVoucherFeedView() {
    bindDelegatedEvents();
    const current = view();
    if (!current) return "";
    const scope = resolveScope();
    if (!scope) {
      return `
        <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500" data-voucher-feed>
          ${renderVoucherFeedLoadingState({ deps: renderDeps })}
        </section>
      `;
    }
    if (!scope.hasLocation) {
      return `
        <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500" data-voucher-feed>
          ${renderVoucherLocationGate({ deps: renderDeps })}
        </section>
      `;
    }

    const signature = `${scope.cityLabel}::${scope.businesses.map((entry) => entry.id).join(",")}`;
    if (current.feed.signature !== signature || current.feed.status === "idle") {
      queueMicrotask(() => {
        void runtime?.loadVoucherFeed?.({ businesses: scope.businesses, signature });
      });
    }

    const nowMs = Date.now();
    const rows = collectVisibleVouchers(nowMs);
    let body = "";
    if (rows.length) {
      body = `
        <div class="space-y-6">
          ${rows.map(({ business, item }) => renderVoucherCard({
            business,
            voucher: item,
            activation: runtime?.getActivation?.(business.id, item.id) || null,
            nowMs,
            deps: renderDeps
          })).join("")}
        </div>
      `;
      // Reichweite und Wiederherstellung laufen einmal je Feed-Zusammensetzung,
      // nicht bei jedem Re-Render.
      const impressionSignature = rows.map((row) => `${row.business.id}:${row.item.id}`).join("|");
      if (lastImpressionSignature !== impressionSignature) {
        lastImpressionSignature = impressionSignature;
        queueMicrotask(() => {
          const byRestaurant = new Map();
          rows.forEach(({ business, item }) => {
            runtime?.markReach?.(business.id, item.id);
            const list = byRestaurant.get(business.id) || [];
            list.push(item.id);
            byRestaurant.set(business.id, list);
          });
          byRestaurant.forEach((voucherIds, restaurantId) => {
            void runtime?.restoreServerActivations?.(restaurantId, voucherIds);
          });
        });
      }
    } else if (current.feed.status === "loading") {
      body = renderVoucherFeedLoadingState({ deps: renderDeps });
    } else if (current.feed.status === "error") {
      body = `
        <div class="bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center">
          <p class="text-sm font-bold text-slate-500">${escapeHtml(current.feed.error || "Ofertat nuk mund te ngarkoheshin.")}</p>
          <button type="button" data-voucher-feed-retry class="mt-5 px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Provo perseri</button>
        </div>
      `;
    } else {
      body = renderVoucherFeedEmptyState({ deps: renderDeps, cityLabel: scope.cityLabel });
    }

    return `
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500" data-voucher-feed>
        <div class="mb-5">
          <h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">Ofertat</h1>
          <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${escapeHtml("Ofertat speciale vetëm në mnyra")}</p>
        </div>
        ${body}
        ${renderVoucherConfirmModal({ confirm: current.confirm, deps: renderDeps })}
      </section>
    `;
  }

  // ------------------------------------------------------------ Business-Tab

  function buildDefaultDraft() {
    const now = Date.now();
    return {
      id: createVoucherId(),
      title: "",
      text: "",
      terms: "",
      badgeLabel: "",
      imageUrl: "",
      cropX: 50,
      cropY: 50,
      active: true,
      startAt: "",
      endAt: new Date(now + (VOUCHER_DEFAULT_RUNTIME_DAYS * DAY_MS)).toISOString(),
      activationMinutes: VOUCHER_DEFAULT_ACTIVATION_MINUTES
    };
  }

  function renderVoucherAdminView() {
    bindDelegatedEvents();
    const current = view();
    if (!current) return "";
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId || !isBusinessOffersProfile(state?.userProfile)) {
      return renderVoucherAdminNoBusinessState({
        deps: renderDeps,
        resolving: !restaurantId && isResolvingBusinessProfile()
      });
    }

    if (current.restaurantId !== restaurantId || current.truthState === "unknown") {
      queueMicrotask(() => {
        void runtime?.loadOwnerVouchers?.(restaurantId);
      });
    }

    if (current.editor) {
      return renderVoucherEditor({ editor: current.editor, deps: renderDeps });
    }

    const meta = getRestaurantMetaById(restaurantId) || {};
    const restaurantName = cleanVoucherText(meta.name || meta.restaurantName || state?.userProfile?.name) || "Business";
    return renderVoucherAdminBody({
      restaurantName,
      items: current.items,
      statsById: current.statsById,
      loading: current.loading,
      enabled: current.enabled,
      error: current.error,
      nowMs: Date.now(),
      deps: renderDeps
    });
  }

  // ------------------------------------------------------------------ Events

  function readValue(id = "") {
    return cleanVoucherText(doc?.getElementById(id)?.value);
  }

  function readChecked(id = "") {
    return doc?.getElementById(id)?.checked === true;
  }

  function openEditor(mode = "create", voucherId = "") {
    const current = view();
    if (!current) return;
    pendingImageFile = null;
    if (mode === "edit") {
      const existing = (Array.isArray(current.items) ? current.items : [])
        .find((item) => item.id === voucherId);
      if (!existing) return;
      current.editor = { mode: "edit", draft: normalizeVoucherItem(existing), status: "", saving: false, imagePreview: "" };
    } else {
      current.editor = { mode: "create", draft: buildDefaultDraft(), status: "", saving: false, imagePreview: "" };
    }
    render();
  }

  function closeEditor() {
    const current = view();
    if (!current) return;
    pendingImageFile = null;
    current.editor = null;
    render();
  }

  function collectEditorDraft() {
    const current = view();
    const base = current?.editor?.draft || {};
    const startMs = fromVoucherInputValue(readValue("voucherStartAt"));
    const endMs = fromVoucherInputValue(readValue("voucherEndAt"));
    return {
      ...base,
      title: readValue("voucherTitle"),
      text: readValue("voucherText"),
      terms: readValue("voucherTerms"),
      badgeLabel: readValue("voucherBadge"),
      startAt: startMs ? new Date(startMs).toISOString() : "",
      endAt: endMs ? new Date(endMs).toISOString() : "",
      activationMinutes: clampActivationMinutes(readValue("voucherActivationMinutes")),
      active: readChecked("voucherActive")
    };
  }

  async function saveEditor() {
    const current = view();
    if (!current?.editor || current.editor.saving) return;
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId) return;
    const draft = collectEditorDraft();
    const validationError = validateVoucherDraft(draft);
    if (validationError) {
      current.editor.draft = draft;
      current.editor.status = validationError;
      render();
      return;
    }
    current.editor.draft = draft;
    current.editor.status = "";
    current.editor.saving = true;
    render();
    try {
      await runtime?.saveVoucherFromEditor?.(restaurantId, draft, { imageFile: pendingImageFile });
      pendingImageFile = null;
      current.editor = null;
    } catch (err) {
      console.error("[mnyra][ofertat] save failed", err);
      if (current.editor) {
        current.editor.saving = false;
        current.editor.status = "Oferta nuk mund te ruhej. Provo perseri.";
      }
    }
    render();
  }

  async function deleteVoucher(voucherId = "") {
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId || !voucherId) return;
    if (!confirmDialog("Ta fshish vertet kete oferte?")) return;
    try {
      await runtime?.deleteVoucherById?.(restaurantId, voucherId);
    } catch (err) {
      console.error("[mnyra][ofertat] delete failed", err);
      alertDialog("Oferta nuk mund te fshihej.");
    }
    render();
  }

  async function toggleEnabled(enabled = true) {
    const restaurantId = resolveOwnRestaurantId();
    if (!restaurantId) return;
    try {
      await runtime?.setVouchersEnabled?.(restaurantId, enabled);
    } catch (err) {
      console.error("[mnyra][ofertat] toggle failed", err);
    }
    render();
  }

  function findVoucherByKey(cardKey = "") {
    const [restaurantId, voucherId] = String(cardKey || "").split("::");
    const rows = collectVisibleVouchers();
    const match = rows.find((row) => row.business?.id === restaurantId && row.item?.id === voucherId);
    return match ? { ...match, restaurantId, voucherId } : null;
  }

  function openActivationConfirm(cardKey = "") {
    const current = view();
    const match = findVoucherByKey(cardKey);
    if (!current || !match) return;
    current.confirm = {
      open: true,
      cardKey,
      restaurantId: match.restaurantId,
      voucherId: match.voucherId,
      title: match.item.title,
      activationMinutes: match.item.activationMinutes
    };
    render();
  }

  function closeActivationConfirm() {
    const current = view();
    if (!current) return;
    current.confirm = null;
    render();
  }

  async function acceptActivation() {
    const current = view();
    const confirmState = current?.confirm;
    if (!confirmState) return;
    const match = findVoucherByKey(confirmState.cardKey);
    current.confirm = null;
    if (!match) {
      render();
      return;
    }
    try {
      await runtime?.activateVoucher?.(match.restaurantId, match.item);
    } catch (err) {
      console.error("[mnyra][ofertat] activate failed", err);
    }
    render();
  }

  function handlePickImage() {
    const input = doc?.getElementById("voucherImageInput");
    if (!(input instanceof HTMLInputElement)) return;
    input.click();
  }

  function handleImageSelected(input) {
    const current = view();
    const file = input?.files?.[0] || null;
    if (!current?.editor || !file) return;
    pendingImageFile = file;
    // Der Draft muss vor dem Re-Render aus dem DOM gerettet werden, sonst
    // verliert der Nutzer seine Eingaben nur weil er ein Bild gewaehlt hat.
    current.editor.draft = collectEditorDraft();
    try {
      current.editor.imagePreview = win?.URL?.createObjectURL?.(file) || "";
    } catch {
      current.editor.imagePreview = "";
    }
    render();
  }

  function bindDelegatedEvents() {
    if (delegationBound || !doc) return;
    delegationBound = true;

    doc.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      try {
        const activateBtn = target.closest("[data-voucher-activate]");
        if (activateBtn) {
          event.preventDefault();
          openActivationConfirm(activateBtn.getAttribute("data-voucher-activate") || "");
          return;
        }
        if (target.closest("[data-voucher-confirm-accept]")) {
          event.preventDefault();
          void acceptActivation();
          return;
        }
        if (target.closest("[data-voucher-confirm-cancel]") || target.closest("[data-voucher-confirm-dismiss]")) {
          event.preventDefault();
          closeActivationConfirm();
          return;
        }
        if (target.closest("[data-voucher-feed-retry]")) {
          event.preventDefault();
          const scope = resolveScope();
          if (scope) {
            void runtime?.loadVoucherFeed?.({
              businesses: scope.businesses,
              signature: `${scope.cityLabel}::${scope.businesses.map((entry) => entry.id).join(",")}`,
              force: true
            });
          }
          return;
        }
        if (target.closest("[data-voucher-add]")) {
          event.preventDefault();
          openEditor("create");
          return;
        }
        const editBtn = target.closest("[data-voucher-edit]");
        if (editBtn) {
          event.preventDefault();
          openEditor("edit", editBtn.getAttribute("data-voucher-edit") || "");
          return;
        }
        const deleteBtn = target.closest("[data-voucher-delete]");
        if (deleteBtn) {
          event.preventDefault();
          void deleteVoucher(deleteBtn.getAttribute("data-voucher-delete") || "");
          return;
        }
        if (target.closest("[data-voucher-editor-close]")) {
          event.preventDefault();
          closeEditor();
          return;
        }
        if (target.closest("[data-voucher-save]")) {
          event.preventDefault();
          void saveEditor();
          return;
        }
        if (target.closest("[data-voucher-pick-image]")) {
          event.preventDefault();
          handlePickImage();
        }
      } catch (err) {
        console.error("[mnyra][ofertat] click handler failed", err);
      }
    });

    doc.addEventListener("change", (event) => {
      const target = event.target;
      if (!target) return;
      try {
        if (target.id === "voucherEnabledToggle") {
          void toggleEnabled(target.checked === true);
          return;
        }
        if (target.id === "voucherImageInput") {
          handleImageSelected(target);
        }
      } catch (err) {
        console.error("[mnyra][ofertat] change handler failed", err);
      }
    });

    startCountdownTicker();
  }

  // Sekundentakt: schreibt nur Textknoten. Laeuft eine Aktivierung ab, wird
  // genau einmal ein echter Re-Render angestossen, damit die Karte wieder in
  // den Ausgangszustand wechselt.
  function tickCountdowns() {
    if (!doc) return;
    const nodes = doc.querySelectorAll("[data-voucher-countdown]");
    const badges = doc.querySelectorAll("[data-voucher-window-badge]");
    if (!nodes.length && !badges.length) return;
    const nowMs = Date.now();
    let needsRender = false;

    nodes.forEach((node) => {
      const expiresAtMs = Number(node.getAttribute("data-voucher-expires")) || 0;
      const remaining = expiresAtMs - nowMs;
      if (remaining <= 0) {
        needsRender = true;
        return;
      }
      const next = formatActivationCountdown(remaining);
      if (node.textContent !== next) node.textContent = next;
    });

    badges.forEach((badge) => {
      const cardKey = badge.getAttribute("data-voucher-window-badge") || "";
      const match = findVoucherByKey(cardKey);
      if (!match) return;
      const window = resolveVoucherWindow(match.item, nowMs);
      if (window.status !== "live") {
        needsRender = true;
        return;
      }
      const label = badge.querySelector("[data-voucher-window-label]");
      const nextLabel = formatVoucherRemaining(window.remainingMs);
      if (label && label.textContent !== nextLabel) label.textContent = nextLabel;
      const nextColor = URGENCY_BADGE_STYLE[resolveVoucherUrgency(window.remainingMs)] || URGENCY_BADGE_STYLE.none;
      if (badge.style.backgroundColor !== nextColor) badge.style.backgroundColor = nextColor;
    });

    if (needsRender) render();
  }

  function startCountdownTicker() {
    if (tickHandle || !win?.setInterval) return;
    tickHandle = win.setInterval(() => {
      try {
        tickCountdowns();
      } catch {}
    }, COUNTDOWN_TICK_MS);
  }

  function stopCountdownTicker() {
    if (!tickHandle || !win?.clearInterval) return;
    win.clearInterval(tickHandle);
    tickHandle = 0;
  }

  function preloadVoucherFeed() {
    void ensureMarketplaceModule().catch(() => null);
  }

  return Object.freeze({
    renderVoucherFeedView,
    renderVoucherAdminView,
    preloadVoucherFeed,
    stopCountdownTicker,
    collectVisibleVouchers,
    resolveActivationStateFor: (restaurantId = "", voucherId = "", nowMs = Date.now()) => resolveActivationState(
      runtime?.getActivation?.(restaurantId, voucherId) || null,
      nowMs
    ),
    buildActivationKey: buildVoucherActivationKey
  });
}
