export function createDefaultLeadPricingCore({
  leadTypeOrder = []
} = {}) {
  return leadTypeOrder.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

export function normalizeLeadPricingCore(raw = {}, {
  leadTypeOrder = []
} = {}) {
  const base = createDefaultLeadPricingCore({
    leadTypeOrder
  });
  Object.keys(base).forEach((key) => {
    const num = Number(raw?.[key]);
    base[key] = Number.isFinite(num) && num >= 0 ? num : 0;
  });
  return base;
}
