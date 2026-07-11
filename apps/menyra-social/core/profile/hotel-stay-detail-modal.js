import { collectHotelStayImagesCore } from "./hotel-stay-section-utils.js";

export const HOTEL_STAY_DETAIL_MODAL_VERSION = "hotel-stay-detail-modal.v1";

const ROOT_ID = "hotelStayDetailOverlayRoot";

// Registry der aktuell gerenderten Dhoma-/Oferta-Karten: die Detailseite
// registriert ihre Items bei jedem Render, der "Me shume"-Klick schlaegt hier
// nach. Ein einziger delegierter Listener reicht fuer alle Re-Renders.
const registry = {
  room: new Map(),
  offer: new Map(),
  imageUrlFn: null
};

const modalState = {
  open: false,
  item: null,
  kind: "room",
  index: 0
};

let bindingsInstalled = false;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function escapeHtml(value = "") {
  return asText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function svgIcon(path = "", extraClass = "w-4 h-4") {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const ICONS = Object.freeze({
  x: `<path d="M18 6 6 18M6 6l12 12"/>`,
  chevronLeft: `<path d="m15 18-6-6 6-6"/>`,
  chevronRight: `<path d="m9 18 6-6-6-6"/>`,
  check: `<path d="m20 6-11 11-5-5"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>`,
  bed: `<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>`,
  size: `<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>`,
  nav: `<path d="m3 11 19-9-9 19-2-8z"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>`,
  waves: `<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>`,
  moon: `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/>`
});

const META_ICON_PATHS = Object.freeze({
  users: ICONS.users,
  bed: ICONS.bed,
  size: ICONS.size,
  nav: ICONS.nav,
  clock: ICONS.clock,
  waves: ICONS.waves,
  moon: ICONS.moon,
  check: ICONS.check
});

function resolveImageUrl(url = "", variant = "large") {
  const raw = asText(url);
  if (!raw) return "";
  if (typeof registry.imageUrlFn !== "function") return raw;
  try {
    return asText(registry.imageUrlFn(raw, variant)) || raw;
  } catch {
    return raw;
  }
}

function getDocument() {
  return typeof document === "undefined" ? null : document;
}

function ensureModalRoot(doc) {
  let root = doc.getElementById(ROOT_ID);
  if (root) return root;
  root = doc.createElement("div");
  root.id = ROOT_ID;
  // Im #overlayRoot mitspielen: so zaehlt das Modal fuer die bestehende
  // Overlay-Logik (Scroll-Lock, Chrome-Tint) als offenes Modal.
  const overlayRoot = doc.getElementById("overlayRoot");
  (overlayRoot || doc.body).appendChild(root);
  return root;
}

function syncModalOpenClasses(doc, open) {
  const hasOtherModal = Array.from(doc.querySelectorAll("#overlayRoot .modal-overlay"))
    .some((node) => !node.closest(`#${ROOT_ID}`));
  const shouldLock = open || hasOtherModal;
  doc.documentElement.classList.toggle("modal-open", shouldLock);
  doc.body.classList.toggle("modal-open", shouldLock);
}

function renderMetaChips(metaParts = []) {
  const parts = (Array.isArray(metaParts) ? metaParts : []).filter((part) => asText(part?.label));
  if (!parts.length) return "";
  return `
    <div class="flex flex-wrap gap-2">
      ${parts.map((part) => `
        <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-600">
          ${svgIcon(META_ICON_PATHS[part.icon] || ICONS.check, "w-3.5 h-3.5 text-slate-400")}
          ${escapeHtml(part.label)}
        </span>
      `).join("")}
    </div>
  `;
}

function renderFeatureList(features = []) {
  const items = (Array.isArray(features) ? features : []).map(asText).filter(Boolean);
  if (!items.length) return "";
  return `
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-2">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përfshihet</p>
      ${items.slice(0, 12).map((label) => `
        <p class="flex items-center gap-2 text-xs font-bold text-slate-700">
          ${svgIcon(ICONS.check, "w-3.5 h-3.5 text-emerald-500 shrink-0")}
          <span>${escapeHtml(label)}</span>
        </p>
      `).join("")}
    </div>
  `;
}

function renderGallery(item, index = 0) {
  const images = collectHotelStayImagesCore(item);
  if (!images.length) {
    return `
      <div class="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-100 h-56 flex items-center justify-center">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Pa foto</span>
      </div>
    `;
  }
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  const hero = resolveImageUrl(images[safeIndex], "large");
  return `
    <div data-hotel-stay-gallery class="space-y-3">
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-100">
        <img data-hotel-stay-hero src="${escapeHtml(hero)}" alt="${escapeHtml(item.title)}" class="w-full h-64 object-cover" decoding="async" />
        ${images.length > 1 ? `
          <button type="button" data-hotel-stay-nav="prev" aria-label="Foto e mëparshme" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-700 shadow flex items-center justify-center active:scale-95">
            ${svgIcon(ICONS.chevronLeft)}
          </button>
          <button type="button" data-hotel-stay-nav="next" aria-label="Foto tjetër" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-700 shadow flex items-center justify-center active:scale-95">
            ${svgIcon(ICONS.chevronRight)}
          </button>
          <span data-hotel-stay-counter class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-[10px] font-black">${safeIndex + 1} / ${images.length}</span>
        ` : ""}
      </div>
      ${images.length > 1 ? `
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          ${images.map((url, thumbIndex) => `
            <button type="button" data-hotel-stay-thumb="${thumbIndex}" aria-label="Foto ${thumbIndex + 1}" class="w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 ${thumbIndex === safeIndex ? "border-slate-900" : "border-transparent opacity-70"}">
              <img src="${escapeHtml(resolveImageUrl(url, "thumb"))}" alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderModalHtml(item, kind, index = 0) {
  const isOffer = kind === "offer";
  const eyebrow = isOffer ? "Oferta" : "Dhoma";
  const priceLabel = asText(item.priceLabel);
  const priceSuffix = asText(item.priceSuffix) || "/ natë";
  const description = asText(item.text || item.description);
  return `
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div data-hotel-stay-modal-dismiss class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div class="min-w-0">
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtml(eyebrow)}</span>
              <h3 class="text-xl font-black italic tracking-tighter truncate">${escapeHtml(item.title || eyebrow)}</h3>
              ${asText(item.tag) ? `<p class="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">${escapeHtml(item.tag)}</p>` : ""}
            </div>
            <button type="button" data-hotel-stay-modal-dismiss class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0" aria-label="Mbyll">
              ${svgIcon(ICONS.x)}
            </button>
          </div>
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
            ${renderGallery(item, index)}
            ${priceLabel ? `
              <div class="flex items-end justify-between p-4 rounded-[1.6rem] bg-slate-900 text-white">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Çmimi</span>
                <span class="text-right">
                  <strong class="text-2xl font-black tracking-tight">${escapeHtml(priceLabel)}</strong>
                  <small class="block text-[10px] font-bold text-slate-300">${escapeHtml(priceSuffix)}</small>
                </span>
              </div>
            ` : ""}
            ${renderMetaChips(item.metaParts)}
            ${description ? `<p class="text-sm font-medium text-slate-600 leading-relaxed">${escapeHtml(description)}</p>` : ""}
            ${renderFeatureList(item.features)}
          </div>
          <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
            <button type="button" data-hotel-stay-modal-dismiss class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
              Mbyll
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeHotelStayDetailModal() {
  const doc = getDocument();
  if (!doc) return;
  modalState.open = false;
  modalState.item = null;
  modalState.index = 0;
  const root = doc.getElementById(ROOT_ID);
  if (root) root.innerHTML = "";
  syncModalOpenClasses(doc, false);
}

function openHotelStayDetailModal(kind = "room", itemId = "") {
  const doc = getDocument();
  if (!doc) return;
  const map = registry[kind === "offer" ? "offer" : "room"];
  const item = map.get(asText(itemId));
  if (!item) return;
  modalState.open = true;
  modalState.item = item;
  modalState.kind = kind === "offer" ? "offer" : "room";
  modalState.index = 0;
  const root = ensureModalRoot(doc);
  root.innerHTML = renderModalHtml(item, modalState.kind, 0);
  syncModalOpenClasses(doc, true);
}

// Galerie-Wechsel ohne kompletten Re-Render: nur Hero, Zaehler und
// Thumbnail-Markierung werden gepatcht.
function setGalleryIndex(nextIndex) {
  const doc = getDocument();
  if (!doc || !modalState.open || !modalState.item) return;
  const images = collectHotelStayImagesCore(modalState.item);
  if (images.length < 2) return;
  const count = images.length;
  const index = ((Number(nextIndex) % count) + count) % count;
  modalState.index = index;
  const root = doc.getElementById(ROOT_ID);
  if (!root) return;
  const hero = root.querySelector("[data-hotel-stay-hero]");
  if (hero) hero.setAttribute("src", resolveImageUrl(images[index], "large"));
  const counter = root.querySelector("[data-hotel-stay-counter]");
  if (counter) counter.textContent = `${index + 1} / ${count}`;
  root.querySelectorAll("[data-hotel-stay-thumb]").forEach((btn) => {
    const active = Number(btn.getAttribute("data-hotel-stay-thumb")) === index;
    btn.classList.toggle("border-slate-900", active);
    btn.classList.toggle("border-transparent", !active);
    btn.classList.toggle("opacity-70", !active);
  });
}

function handleDocumentClick(event) {
  const target = event.target;
  if (!target || typeof target.closest !== "function") return;
  const moreBtn = target.closest("[data-hotel-stay-more]");
  if (moreBtn) {
    event.preventDefault();
    openHotelStayDetailModal(
      asText(moreBtn.getAttribute("data-hotel-stay-kind")) || "room",
      asText(moreBtn.getAttribute("data-hotel-stay-more"))
    );
    return;
  }
  if (!modalState.open) return;
  const navBtn = target.closest("[data-hotel-stay-nav]");
  if (navBtn) {
    event.preventDefault();
    const direction = asText(navBtn.getAttribute("data-hotel-stay-nav")) === "prev" ? -1 : 1;
    setGalleryIndex(modalState.index + direction);
    return;
  }
  const thumbBtn = target.closest("[data-hotel-stay-thumb]");
  if (thumbBtn) {
    event.preventDefault();
    setGalleryIndex(Number(thumbBtn.getAttribute("data-hotel-stay-thumb")));
    return;
  }
  const dismiss = target.closest("[data-hotel-stay-modal-dismiss]");
  // Der Overlay-Hintergrund schliesst nur bei direktem Treffer; die
  // Schliessen-Buttons immer.
  if (dismiss && (dismiss.tagName === "BUTTON" || dismiss === target)) {
    event.preventDefault();
    closeHotelStayDetailModal();
  }
}

function handleDocumentKeydown(event) {
  if (!modalState.open) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeHotelStayDetailModal();
  } else if (event.key === "ArrowLeft") {
    setGalleryIndex(modalState.index - 1);
  } else if (event.key === "ArrowRight") {
    setGalleryIndex(modalState.index + 1);
  }
}

/**
 * Einmalige, delegierte Bindings fuer alle "Me shume"-Buttons der
 * Hotel-Detailseite - ueberlebt beliebige Re-Renders der Seite.
 */
export function ensureHotelStayDetailModalBindings() {
  const doc = getDocument();
  if (!doc || bindingsInstalled) return;
  bindingsInstalled = true;
  doc.addEventListener("click", handleDocumentClick);
  doc.addEventListener("keydown", handleDocumentKeydown);
}

/**
 * Items der aktuell gerenderten Detailseite registrieren (Zimmer + Oferta),
 * damit "Me shume" die vollen Details inkl. aller Fotos zeigt.
 */
export function registerHotelStayDetailItems({
  rooms = [],
  offers = [],
  imageUrlFn = null
} = {}) {
  registry.room = new Map(
    (Array.isArray(rooms) ? rooms : [])
      .filter((item) => item && asText(item.id))
      .map((item) => [asText(item.id), item])
  );
  registry.offer = new Map(
    (Array.isArray(offers) ? offers : [])
      .filter((item) => item && asText(item.id))
      .map((item) => [asText(item.id), item])
  );
  if (typeof imageUrlFn === "function") registry.imageUrlFn = imageUrlFn;
  // Offenes Modal aktuell halten: Item verschwunden -> schliessen.
  if (modalState.open && modalState.item) {
    const map = registry[modalState.kind];
    const fresh = map.get(asText(modalState.item.id));
    if (!fresh) closeHotelStayDetailModal();
    else modalState.item = fresh;
  }
  ensureHotelStayDetailModalBindings();
}
