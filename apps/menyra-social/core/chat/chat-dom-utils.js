export function captureChatInputFocusStateCore({
  documentObj,
  inputId = "chatMessageInput"
} = {}) {
  const doc = documentObj || null;
  if (!doc) return null;
  const active = doc.activeElement;
  if (!(active instanceof HTMLTextAreaElement)) return null;
  if (active.id !== inputId) return null;
  return {
    selectionStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
    selectionEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null
  };
}

export function restoreChatInputFocusStateCore({
  focusState,
  canRestore = false,
  documentObj,
  queueMicrotaskFn,
  inputId = "chatMessageInput",
  maxHeight = 112
} = {}) {
  if (!focusState || !canRestore) return false;
  const doc = documentObj || null;
  if (!doc) return false;
  const queue = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => Promise.resolve().then(fn));
  queue(() => {
    const input = doc.getElementById(inputId);
    if (!(input instanceof HTMLTextAreaElement)) return;
    if (input.disabled || input.readOnly) return;
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
    const len = String(input.value || "").length;
    const rawStart = Number.isFinite(Number(focusState.selectionStart)) ? Number(focusState.selectionStart) : len;
    const rawEnd = Number.isFinite(Number(focusState.selectionEnd)) ? Number(focusState.selectionEnd) : rawStart;
    const start = Math.max(0, Math.min(len, rawStart));
    const end = Math.max(start, Math.min(len, rawEnd));
    try {
      input.setSelectionRange(start, end);
    } catch {}
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, maxHeight)}px`;
  });
  return true;
}

export function scrollChatMessagesToBottomCore({
  documentObj,
  windowObj,
  queueMicrotaskFn,
  containerId = "chatMessages"
} = {}) {
  const doc = documentObj || null;
  if (!doc) return false;
  const chatMessages = doc.getElementById(containerId);
  if (!(chatMessages instanceof HTMLElement)) return false;
  const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  const queue = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => Promise.resolve().then(fn));

  scrollToBottom();
  queue(scrollToBottom);
  if (typeof windowObj?.requestAnimationFrame === "function") {
    windowObj.requestAnimationFrame(() => {
      scrollToBottom();
      windowObj.requestAnimationFrame(scrollToBottom);
    });
  }
  chatMessages.querySelectorAll("img,video").forEach((media) => {
    if (!(media instanceof HTMLElement)) return;
    if (media.dataset.chatScrollBound === "true") return;
    media.dataset.chatScrollBound = "true";
    if (media instanceof HTMLImageElement) {
      if (media.complete) return;
      media.addEventListener("load", scrollToBottom, { once: true });
      media.addEventListener("error", scrollToBottom, { once: true });
      return;
    }
    if (media instanceof HTMLVideoElement) {
      if (media.readyState >= 2) return;
      media.addEventListener("loadeddata", scrollToBottom, { once: true });
      media.addEventListener("error", scrollToBottom, { once: true });
    }
  });
  return true;
}

export function autosizeTextareaCore(
  el,
  {
    minHeight = 56,
    maxHeight = 160
  } = {}
) {
  if (!(el instanceof HTMLTextAreaElement)) return;
  el.style.height = "auto";
  const next = Math.max(minHeight, Math.min(maxHeight, el.scrollHeight || minHeight));
  el.style.height = `${next}px`;
}
