export function renderOrdersViewCore({
  state = null,
  isLocalBusinessProfileFn = () => false,
  canAccessRestaurantOrdersFn = () => false,
  escapeHtmlFn = (value) => String(value ?? ""),
  getOptimizedImageUrlFn = (value) => String(value || ""),
  formatPriceFn = (value) => String(value ?? ""),
  parsePriceValueFn = () => 0,
  formatRelativeFn = (value) => String(value || ""),
  toDateSafeFn = (value) => value,
} = {}) {
  const isLocalBusinessProfile =
    typeof isLocalBusinessProfileFn === "function"
      ? isLocalBusinessProfileFn
      : () => false;
  const canAccessRestaurantOrders =
    typeof canAccessRestaurantOrdersFn === "function"
      ? canAccessRestaurantOrdersFn
      : () => false;
  const escapeHtml =
    typeof escapeHtmlFn === "function"
      ? escapeHtmlFn
      : (value) => String(value ?? "");
  const getOptimizedImageUrl =
    typeof getOptimizedImageUrlFn === "function"
      ? getOptimizedImageUrlFn
      : (value) => String(value || "");
  const formatPrice =
    typeof formatPriceFn === "function"
      ? formatPriceFn
      : (value) => String(value ?? "");
  const parsePriceValue =
    typeof parsePriceValueFn === "function" ? parsePriceValueFn : () => 0;
  const formatRelative =
    typeof formatRelativeFn === "function"
      ? formatRelativeFn
      : (value) => String(value || "");
  const toDateSafe =
    typeof toDateSafeFn === "function" ? toDateSafeFn : (value) => value;
  const isBusiness = canAccessRestaurantOrders(state?.userProfile);
  const orders = Array.isArray(state?.orders?.items) ? state.orders.items : [];
  const hasOrders = orders.length > 0;
  const isLoading = state?.orders?.loading === true;
  const errorMessage = String(state?.orders?.error || "").trim();
  const refreshNotice =
    hasOrders && isLoading
      ? `<div class="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Porosite po perditesohen...</div>`
      : "";
  const retainedErrorNotice =
    hasOrders && errorMessage
      ? `<div class="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${escapeHtml(errorMessage)}</div>`
      : "";

  return `
    <div id="ordersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Orders</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Porosite</h2>
        </div>
      </div>
      ${
        isLoading && !hasOrders
          ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Porosite po ngarkohen...</div>
      `
          : errorMessage && !hasOrders
            ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-rose-500">${escapeHtml(errorMessage)}</div>
      `
            : hasOrders
              ? `
        ${refreshNotice}
        ${retainedErrorNotice}
        <div class="space-y-4">
          ${orders
            .map((order) => {
              const orderItems = Array.isArray(order?.items) ? order.items : [];
              const avatarRaw = isBusiness
                ? order?.buyerAvatar
                : order?.businessAvatar;
              const avatarUrl = getOptimizedImageUrl(avatarRaw, "avatar");
              const fallbackName = isBusiness
                ? order?.contact?.name || order?.buyerName || "Kunde"
                : order?.businessName || "Shop";
              const tableLabel = order?.tableNumber
                ? `Tavolina ${order.tableNumber}`
                : order?.tableLabel || order?.contact?.tableLabel || "";
              const metaLine = isBusiness
                ? [tableLabel, order?.contact?.phone, order?.contact?.city]
                    .filter(Boolean)
                    .join(" / ")
                : `${order?.itemCount || 0} Artikel`;
              return `
              <div class="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src="${escapeHtml(avatarUrl)}" class="w-full h-full ${isBusiness ? "object-cover" : "object-contain bg-white"}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(fallbackName)}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml(metaLine)}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">${escapeHtml(order?.status || "Neu")}</span>
                </div>
                <div class="space-y-2">
                  ${orderItems
                    .slice(0, 3)
                    .map(
                      (item) => `
                    <div class="flex items-start justify-between gap-3 text-sm">
                      <div class="min-w-0">
                        <span class="font-semibold text-slate-700 block truncate pr-3">${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}${item.selectedSize || item.selectedColor ? ` <span class="text-slate-400">(${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))})</span>` : ""}</span>
                        ${item.comment ? `<p class="text-[10px] font-semibold text-slate-400 mt-1 truncate">Koment: ${escapeHtml(item.comment)}</p>` : ""}
                      </div>
                      <span class="font-black text-slate-900 shrink-0">${escapeHtml(formatPrice(parsePriceValue(item.price) * item.quantity))}</span>
                    </div>
                  `,
                    )
                    .join("")}
                  ${orderItems.length > 3 ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-300">+${escapeHtml(orderItems.length - 3)} weitere</p>` : ""}
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    ${isBusiness ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml([tableLabel, order?.contact?.city, order?.contact?.address].filter(Boolean).join(" / "))}</p>` : `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${escapeHtml(order?.buyerHandle || "user")}</p>`}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtml(formatRelative(toDateSafe(order?.createdAt) || new Date()))}</p>
                  </div>
                  <span class="text-base font-black text-slate-900 shrink-0">${escapeHtml(formatPrice(order?.total || 0))}</span>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `
              : `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-300">Ende nuk ka porosi</div>
      `
      }
    </div>
  `;
}
