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

export function ensureOverlayRootCore({ documentObj } = {}) {
  const doc = documentObj || null;
  if (!doc) return null;
  let root = doc.getElementById("overlayRoot");
  if (!root) {
    root = doc.createElement("div");
    root.id = "overlayRoot";
    doc.body.appendChild(root);
  }
  ensureChildNode(root, doc, "modalUnderlay", "fixed inset-0 bg-white z-[50] hidden pointer-events-none");
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

  const anyModalOpen = !!isAnyModalOpen();
  const underlay = doc.getElementById("modalUnderlay");
  if (underlay) underlay.classList.toggle("hidden", !anyModalOpen);
  doc.documentElement.classList.toggle("modal-open", anyModalOpen);
  doc.body.classList.toggle("modal-open", anyModalOpen);
  if (!anyModalOpen) {
    doc.documentElement.classList.remove("menu-detail-comment-focus");
    doc.body.classList.remove("menu-detail-comment-focus");
    doc.documentElement.style.removeProperty("--menu-detail-footer-gap");
  }
  if (anyModalOpen) ensureModalEscapeHandler();
}
