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
let modalScrollLockState = {
  active: false,
  scrollX: 0,
  scrollY: 0,
  bodyStyles: null
};

function lockModalScroll(doc, win) {
  if (!doc?.body || !win || modalScrollLockState.active) return;
  const bodyStyle = doc.body.style;
  modalScrollLockState = {
    active: true,
    scrollX: Math.max(0, Number(win.scrollX || win.pageXOffset || 0)),
    scrollY: Math.max(0, Number(win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0)),
    bodyStyles: {
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      overflow: bodyStyle.overflow
    }
  };
  bodyStyle.position = "fixed";
  bodyStyle.top = `${-modalScrollLockState.scrollY}px`;
  bodyStyle.left = `${-modalScrollLockState.scrollX}px`;
  bodyStyle.right = "0";
  bodyStyle.width = "100%";
  bodyStyle.overflow = "hidden";
}

function unlockModalScroll(doc, win) {
  if (!doc?.body || !modalScrollLockState.active) return;
  const {
    scrollX,
    scrollY,
    bodyStyles
  } = modalScrollLockState;
  const bodyStyle = doc.body.style;
  bodyStyle.position = bodyStyles?.position || "";
  bodyStyle.top = bodyStyles?.top || "";
  bodyStyle.left = bodyStyles?.left || "";
  bodyStyle.right = bodyStyles?.right || "";
  bodyStyle.width = bodyStyles?.width || "";
  bodyStyle.overflow = bodyStyles?.overflow || "";
  modalScrollLockState = {
    active: false,
    scrollX: 0,
    scrollY: 0,
    bodyStyles: null
  };
  if (!win?.scrollTo) return;
  const currentX = Math.max(0, Number(win.scrollX || win.pageXOffset || 0));
  const currentY = Math.max(0, Number(win.scrollY || win.pageYOffset || doc.documentElement.scrollTop || 0));
  if (Math.abs(currentX - scrollX) < 1 && Math.abs(currentY - scrollY) < 1) return;
  win.scrollTo(scrollX, scrollY);
}

function syncThemeColorMeta(doc, nextColor) {
  if (!doc?.head) return null;
  let meta = doc.head.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = doc.createElement("meta");
    meta.setAttribute("name", "theme-color");
    doc.head.appendChild(meta);
  }
  meta.setAttribute("content", nextColor);
  return meta;
}

function syncThemeColor(documentObj) {
  const doc = documentObj || null;
  if (!doc) return;
  const useSurface = doc.documentElement.classList.contains("modal-open");
  const nextColor = useSurface ? OVERLAY_CHROME_COLOR : APP_CHROME_COLOR;
  doc.documentElement.style.setProperty("--modal-safe-area-color", nextColor);
  syncThemeColorMeta(doc, nextColor);
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
  ensureChildNode(root, doc, "modalUnderlay", "fixed inset-0 bg-white z-[60] hidden pointer-events-none");
  ensureChildNode(root, doc, "profileOverlayRoot");
  ensureChildNode(root, doc, "chatOverlayRoot");
  ensureChildNode(root, doc, "postOverlayRoot");
  ensureChildNode(root, doc, "likesOverlayRoot");
  ensureChildNode(root, doc, "menuOverlayRoot");
  ensureChildNode(root, doc, "menuDetailOverlayRoot");
  ensureChildNode(root, doc, "focusOverlayRoot");
  ensureChildNode(root, doc, "leadOverlayRoot");
  ensureChildNode(root, doc, "customerOverlayRoot");
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
  windowObj,
  isAnyModalOpenFn,
  ensureModalEscapeHandlerFn
} = {}) {
  const doc = documentObj || null;
  const win = windowObj || null;
  if (!doc) return;
  const isAnyModalOpen = typeof isAnyModalOpenFn === "function"
    ? isAnyModalOpenFn
    : (() => false);
  const ensureModalEscapeHandler = typeof ensureModalEscapeHandlerFn === "function"
    ? ensureModalEscapeHandlerFn
    : (() => {});

  const anyModalOpen = !!isAnyModalOpen();
  const underlay = doc.getElementById("modalUnderlay");
  if (underlay) underlay.classList.add("hidden");
  doc.documentElement.classList.toggle("modal-open", anyModalOpen);
  doc.body.classList.toggle("modal-open", anyModalOpen);
  if (anyModalOpen) {
    lockModalScroll(doc, win);
  } else {
    unlockModalScroll(doc, win);
    doc.documentElement.classList.remove("menu-detail-comment-focus");
    doc.body.classList.remove("menu-detail-comment-focus");
    doc.documentElement.style.removeProperty("--menu-detail-footer-gap");
  }
  syncThemeColor(doc);
  if (anyModalOpen) ensureModalEscapeHandler();
}
