export async function buildNextChatAttachmentsCore({
  fileList,
  existingAttachments = [],
  maxAttachments = 4,
  buildInlineChatAttachment,
  nowMsFn,
  randomFn
} = {}) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return Array.isArray(existingAttachments) ? existingAttachments.slice() : [];
  const existing = Array.isArray(existingAttachments) ? existingAttachments.slice() : [];
  const slotsLeft = Math.max(0, Number(maxAttachments || 4) - existing.length);
  if (!slotsLeft) return existing;
  const selected = files.slice(0, slotsLeft);
  const inlineBuilder = typeof buildInlineChatAttachment === "function"
    ? buildInlineChatAttachment
    : (async () => ({ name: "Datei", mime: "application/octet-stream", size: 0, dataUrl: "", oversize: true }));
  const readNowMs = typeof nowMsFn === "function" ? nowMsFn : (() => Date.now());
  const readRandom = typeof randomFn === "function" ? randomFn : (() => Math.random());
  const nextAttachments = [];

  for (const file of selected) {
    const isImage = /^image\//i.test(String(file?.type || ""));
    const inlineAttachment = await inlineBuilder(file, isImage);
    nextAttachments.push({
      id: `att_${readNowMs()}_${readRandom().toString(36).slice(2, 8)}`,
      name: inlineAttachment?.name || file?.name || "Datei",
      mime: inlineAttachment?.mime || file?.type || "application/octet-stream",
      kind: isImage ? "image" : "file",
      dataUrl: inlineAttachment?.dataUrl || "",
      size: Math.max(0, Number(inlineAttachment?.size || file?.size || 0) || 0),
      oversize: !!inlineAttachment?.oversize
    });
  }
  return [...existing, ...nextAttachments];
}

export function removePendingChatAttachmentCore({
  attachments = [],
  attachmentId = ""
} = {}) {
  const safeId = String(attachmentId || "");
  if (!safeId) return Array.isArray(attachments) ? attachments.slice() : [];
  return (Array.isArray(attachments) ? attachments : [])
    .filter((item) => String(item?.id || "") !== safeId);
}

export function toggleChatMessageFlagCore({
  messages = [],
  messageId = "",
  flag = "saved"
} = {}) {
  const safeId = String(messageId || "");
  if (!safeId) {
    return {
      messages: Array.isArray(messages) ? messages.slice() : [],
      nextValue: null
    };
  }
  let nextValue = null;
  const key = flag === "liked" ? "liked" : "saved";
  const nextMessages = (Array.isArray(messages) ? messages : []).map((message) => (
    String(message?.id || "") === safeId
      ? (() => {
        nextValue = !message?.[key];
        return { ...message, [key]: nextValue };
      })()
      : message
  ));
  return { messages: nextMessages, nextValue };
}

export function createOutgoingChatMessageCore({
  text = "",
  attachments = [],
  createdAt = "",
  nowMsFn,
  randomFn
} = {}) {
  const readNowMs = typeof nowMsFn === "function" ? nowMsFn : (() => Date.now());
  const readRandom = typeof randomFn === "function" ? randomFn : (() => Math.random());
  const safeCreatedAt = String(createdAt || new Date().toISOString());
  return {
    id: `msg_${readNowMs()}_${readRandom().toString(36).slice(2, 8)}`,
    from: "self",
    text: String(text || ""),
    attachments: Array.isArray(attachments) ? attachments.slice() : [],
    liked: false,
    saved: false,
    read: true,
    createdAt: safeCreatedAt
  };
}
