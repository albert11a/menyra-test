export function resolveChatSendPayloadCore({
  inputValue,
  draft,
  attachments = []
} = {}) {
  const text = String(inputValue ?? draft ?? "").trim();
  const safeAttachments = Array.isArray(attachments) ? attachments.slice() : [];
  return {
    text,
    attachments: safeAttachments,
    canSend: !!text || safeAttachments.length > 0
  };
}

export function buildChatSendLocalUpdateCore({
  currentMessages = [],
  text = "",
  attachments = [],
  createdAt = "",
  createOutgoingChatMessage,
  pruneChatMessages,
  buildChatPreviewText,
  getChatMessageTimestamp
} = {}) {
  const createOutgoing = typeof createOutgoingChatMessage === "function"
    ? createOutgoingChatMessage
    : (() => null);
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  const buildPreview = typeof buildChatPreviewText === "function"
    ? buildChatPreviewText
    : (() => "");
  const readTs = typeof getChatMessageTimestamp === "function"
    ? getChatMessageTimestamp
    : (() => 0);
  const outgoingMessage = createOutgoing({ text, attachments, createdAt });
  const nextMessages = prune([...(Array.isArray(currentMessages) ? currentMessages : []), outgoingMessage]);
  return {
    outgoingMessage,
    nextMessages,
    threadPatch: {
      lastMessage: text || buildPreview({ attachments }),
      unreadCount: 0,
      updatedAt: readTs({ createdAt })
    }
  };
}
