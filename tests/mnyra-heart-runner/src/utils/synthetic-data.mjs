export function createSyntheticEntitySet(prefix = "mnyra-heart-synth") {
  const stamp = Date.now();
  return {
    userHandle: `${prefix}-user-${stamp}`,
    businessName: `${prefix}-biz-${stamp}`,
    postCaption: `${prefix}-post-${stamp}`,
    chatMessage: `${prefix}-chat-${stamp}`,
    crmLeadName: `${prefix}-lead-${stamp}`,
    orderNote: `${prefix}-order-${stamp}`
  };
}
