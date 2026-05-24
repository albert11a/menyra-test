function ensureChildNode(parent, documentObj, id, className = "") {
  let node = documentObj.getElementById(id);
  if (!node) {
    node = documentObj.createElement("div");
    node.id = id;
    if (className) node.className = className;
    parent.appendChild(node);
  }
  return node;
}

const OVERLAY_CHROME_COLOR = "#ffffff";
const APP_CHROME_COLOR = "#f8fafc";
const OVERLAY_ROOT_Z_INDEX = "200";

function syncThemeColorMeta(doc, nextColor) {
  if (!doc?.head) return null;
  const win = doc.defaultView || null;
  const normalizedColor = isConcreteColorToken(nextColor) ? String(nextColor).trim() : APP_CHROME_COLOR;
  const writeMeta = () => {
    const metas = Array.from(doc.head.querySelectorAll('meta[name="theme-color"]'));
    let meta = metas[0] || null;
    if (!meta) {
      meta = doc.createElement("meta");
      meta.setAttribute("name", "theme-color");
      doc.head.appendChild(meta);
    }
    if (meta.getAttribute("content") !== normalizedColor) {
      meta.setAttribute("content", normalizedColor);
    }
    for (let i = 1; i < metas.length; i += 1) {
      try {
        metas[i].remove();
      } catch {}
    }
    return meta;
  };

  const committed = writeMeta();
  if (win?.requestAnimationFrame) {
    win.requestAnimationFrame(() => {
      writeMeta();
    });
  }
  if (typeof win?.setTimeout === "function") {
    win.setTimeout(() => {
      writeMeta();
    }, 80);
  }
  return committed;
}

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isConcreteColorToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower.includes("var(")) return false;
  if (lower === "transparent" || lower === "rgba(0, 0, 0, 0)" || lower === "rgba(0,0,0,0)") return false;
  return true;
}

function normalizeChromeColor(value, fallback = APP_CHROME_COLOR) {
  if (!isConcreteColorToken(value)) return fallback;
  return String(value || "").trim();
}

function resolveModalSurfaceColor(doc, overlayEl) {
  if (!doc || !overlayEl) return OVERLAY_CHROME_COLOR;
  const declaredSurface = String(overlayEl.getAttribute("data-modal-surface") || "").trim();
  if (isConcreteColorToken(declaredSurface)) return declaredSurface;
  const inlineSurface = String(overlayEl.style?.getPropertyValue?.("--modal-surface") || "").trim();
  if (isConcreteColorToken(inlineSurface)) return inlineSurface;
  const win = doc.defaultView || null;
  try {
    const computedSurface = String(win?.getComputedStyle?.(overlayEl)?.getPropertyValue("--modal-surface") || "").trim();
    if (isConcreteColorToken(computedSurface)) return computedSurface;
  } catch {}
  const modalSheet = overlayEl.querySelector(".modal-sheet");
  if (modalSheet) {
    try {
      const sheetBackground = String(win?.getComputedStyle?.(modalSheet)?.backgroundColor || "").trim();
      if (isConcreteColorToken(sheetBackground)) {
        return sheetBackground;
      }
    } catch {}
  }
  try {
    const overlayBackground = String(win?.getComputedStyle?.(overlayEl)?.backgroundColor || "").trim();
    if (isConcreteColorToken(overlayBackground)) {
      return overlayBackground;
    }
  } catch {}
  return OVERLAY_CHROME_COLOR;
}

function resolveTopModalSurfaceColor(doc) {
  if (!doc) return OVERLAY_CHROME_COLOR;
  const overlays = Array.from(doc.querySelectorAll("#overlayRoot .modal-overlay"));
  if (!overlays.length) return OVERLAY_CHROME_COLOR;
  let topOverlay = overlays[0];
  let topZIndex = -Infinity;
  let topIndex = -1;
  const win = doc.defaultView || null;
  overlays.forEach((overlay, index) => {
    let zIndex = 0;
    try {
      zIndex = toFiniteNumber(win?.getComputedStyle?.(overlay)?.zIndex, 0);
    } catch {}
    if (zIndex > topZIndex || (zIndex === topZIndex && index > topIndex)) {
      topOverlay = overlay;
      topZIndex = zIndex;
      topIndex = index;
    }
  });
  return resolveModalSurfaceColor(doc, topOverlay);
}

function syncThemeColor(documentObj, { anyModalOpen = false, activeModalSurface = OVERLAY_CHROME_COLOR } = {}) {
  const doc = documentObj || null;
  if (!doc) return;
  const nextColor = anyModalOpen
    ? normalizeChromeColor(activeModalSurface, OVERLAY_CHROME_COLOR)
    : APP_CHROME_COLOR;
  syncThemeColorMeta(doc, nextColor);
  try {
    const forceUiChrome = doc.defaultView?.__MENYRA_SOCIAL_FORCE_UI_CHROME__;
    if (typeof forceUiChrome === "function") forceUiChrome();
  } catch {}
}

export function ensureOverlayRootCore({ documentObj } = {}) {
  const doc = documentObj || null;
  if (!doc) return null;
  let root = doc.getElementById("overlayRoot");
  if (!root) {
    root = doc.createElement("div");
    root.id = "overlayRoot";
    doc.body.appendChild(root);
  }
  root.style.position = "relative";
  root.style.zIndex = OVERLAY_ROOT_Z_INDEX;
  root.style.isolation = "isolate";
  doc.documentElement.style.setProperty("--active-modal-surface", APP_CHROME_COLOR);
  const safariChromeTintTop = ensureChildNode(doc.body, doc, "safariChromeTintTop");
  safariChromeTintTop.style.position = "fixed";
  safariChromeTintTop.style.left = "0";
  safariChromeTintTop.style.right = "0";
  safariChromeTintTop.style.top = "0";
  safariChromeTintTop.style.height = "max(8px, var(--safe-area-top, 0px))";
  safariChromeTintTop.style.background = "var(--active-modal-surface, #ffffff)";
  safariChromeTintTop.style.pointerEvents = "none";
  safariChromeTintTop.style.display = "none";
  safariChromeTintTop.style.zIndex = "2147483000";
  const safariChromeTintBottom = ensureChildNode(doc.body, doc, "safariChromeTintBottom");
  safariChromeTintBottom.style.position = "fixed";
  safariChromeTintBottom.style.left = "0";
  safariChromeTintBottom.style.right = "0";
  safariChromeTintBottom.style.bottom = "0";
  safariChromeTintBottom.style.height = "max(8px, var(--safe-area-bottom, 0px))";
  safariChromeTintBottom.style.background = "var(--active-modal-surface, #ffffff)";
  safariChromeTintBottom.style.pointerEvents = "none";
  safariChromeTintBottom.style.display = "none";
  safariChromeTintBottom.style.zIndex = "2147483000";
  ensureChildNode(root, doc, "modalUnderlay", "fixed inset-0 bg-white z-[60] hidden pointer-events-none");
  ensureChildNode(root, doc, "profileOverlayRoot");
  ensureChildNode(root, doc, "chatOverlayRoot");
  ensureChildNode(root, doc, "postOverlayRoot");
  ensureChildNode(root, doc, "likesOverlayRoot");
  ensureChildNode(root, doc, "menuOverlayRoot");
  ensureChildNode(root, doc, "menuDetailOverlayRoot");
  ensureChildNode(root, doc, "focusOverlayRoot");
  return root;
}

export function ensureModalEscapeHandlerCore({
  documentObj,
  isBound = false,
  setBoundFn,
  closeActiveModalFn
} = {}) {
  const doc = documentObj || null;
  if (isBound || !doc) return;
  const setBound = typeof setBoundFn === "function" ? setBoundFn : (() => {});
  const closeActiveModal = typeof closeActiveModalFn === "function"
    ? closeActiveModalFn
    : (() => false);

  const handler = (evt) => {
    if (evt.key !== "Escape") return;
    if (closeActiveModal()) evt.preventDefault();
  };
  doc.addEventListener("keydown", handler);
  setBound(true);
}

export function syncModalOpenUiStateCore({
  documentObj,
  isAnyModalOpenFn,
  ensureModalEscapeHandlerFn
} = {}) {
  const doc = documentObj || null;
  if (!doc) return;
  const isAnyModalOpen = typeof isAnyModalOpenFn === "function"
    ? isAnyModalOpenFn
    : (() => false);
  const ensureModalEscapeHandler = typeof ensureModalEscapeHandlerFn === "function"
    ? ensureModalEscapeHandlerFn
    : (() => {});

  const anyModalInDom = !!doc.querySelector("#overlayRoot .modal-overlay");
  const anyModalOpen = !!isAnyModalOpen() || anyModalInDom;
  const activeModalSurface = anyModalOpen
    ? resolveTopModalSurfaceColor(doc)
    : APP_CHROME_COLOR;
  doc.documentElement.style.setProperty("--active-modal-surface", activeModalSurface);
  const underlay = doc.getElementById("modalUnderlay");
  if (underlay) {
    underlay.classList.toggle("hidden", !anyModalOpen);
    underlay.style.background = activeModalSurface;
  }
  const safariChromeTintTop = doc.getElementById("safariChromeTintTop");
  if (safariChromeTintTop) {
    safariChromeTintTop.style.display = anyModalOpen ? "block" : "none";
    safariChromeTintTop.style.background = activeModalSurface;
  }
  const safariChromeTintBottom = doc.getElementById("safariChromeTintBottom");
  if (safariChromeTintBottom) {
    safariChromeTintBottom.style.display = anyModalOpen ? "block" : "none";
    safariChromeTintBottom.style.background = activeModalSurface;
  }
  doc.documentElement.classList.toggle("modal-open", anyModalOpen);
  doc.body.classList.toggle("modal-open", anyModalOpen);
  if (!anyModalOpen) {
    delete doc.documentElement.dataset.postCommentFocus;
    delete doc.documentElement.dataset.postFooterGap;
    delete doc.documentElement.dataset.menuDetailCommentFocus;
    delete doc.documentElement.dataset.menuDetailFooterGap;
    doc.documentElement.classList.remove("menu-detail-comment-focus");
    doc.body.classList.remove("menu-detail-comment-focus");
    doc.documentElement.style.removeProperty("--menu-detail-footer-gap");
  }
  syncThemeColor(doc, { anyModalOpen, activeModalSurface });
  if (anyModalOpen) ensureModalEscapeHandler();
}
