import {
  MAX_HOTEL_ROOM_IMAGES,
  normalizeHotelRoomsCore
} from "./hotel-rooms-utils.js";
import {
  HOTEL_STAY_SECTION_OFFERS,
  HOTEL_STAY_SECTION_ROOMS,
  normalizeHotelStaySectionCore
} from "./hotel-stay-section-utils.js";

export const HOTEL_ROOMS_EDITOR_RENDER_UTILS_VERSION = "hotel-rooms-editor-render-utils.v2";

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

function fieldMarkup({ id = "", label = "", value = "", placeholder = "", type = "text", inputmode = "" } = {}) {
  return `
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${escapeHtml(label)}</span>
      <input id="${escapeHtml(id)}" name="${escapeHtml(id)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${inputmode ? `inputmode="${escapeHtml(inputmode)}"` : ""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `;
}

// Foto-Galerie pro Zimmer: bestehende Bilder + neue lokale Vorschauen, jeweils
// mit Entfernen-Button. Die bestehenden URLs leben in einem Hidden-Input, damit
// die DOM-Read-Back-Mechanik der Bindings sie bei jedem Re-Render behaelt.
function renderRoomImagesEditor(room = {}, { imagePreviews = [] } = {}) {
  const id = escapeHtml(room.id);
  const existingImages = Array.isArray(room.images) ? room.images.map(asText).filter(Boolean) : [];
  // Previews nicht filtern: der Index muss zu den imageFiles der Bindings passen.
  const previews = (Array.isArray(imagePreviews) ? imagePreviews : []).map(asText);
  const totalCount = existingImages.length + previews.length;
  const tile = (url, index, source) => `
    <div class="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0">
      ${url
        ? `<img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />`
        : `<span class="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300 uppercase">Foto</span>`}
      ${index === 0 && source === "existing" ? `<span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/70 text-white text-[8px] font-black uppercase">Kryesore</span>` : ""}
      <button type="button" data-hotel-room-image-remove="${id}" data-hotel-room-image-index="${index}" data-hotel-room-image-source="${source}" class="absolute top-1 right-1 w-6 h-6 rounded-lg bg-white/90 text-slate-500 flex items-center justify-center text-[10px] font-black shadow" aria-label="Hiq foton">✕</button>
    </div>
  `;
  return `
    <div class="space-y-3">
      ${totalCount ? `
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          ${existingImages.map((url, index) => tile(url, index, "existing")).join("")}
          ${previews.map((url, index) => tile(url, index, "new")).join("")}
        </div>
      ` : ""}
      <div class="flex items-center gap-3">
        <input type="file" id="hotelRoomImageInput_${id}" data-hotel-room-image-input="${id}" accept="image/*" multiple hidden />
        <button type="button" data-hotel-room-image-trigger="${id}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${totalCount >= MAX_HOTEL_ROOM_IMAGES ? "disabled" : ""}>
          ${totalCount ? "Shto foto" : "Ngarko foto"}
        </button>
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">${totalCount} / ${MAX_HOTEL_ROOM_IMAGES}</span>
      </div>
      <input type="hidden" id="hotelRoomImagesData_${id}" value="${escapeHtml(existingImages.join("\n"))}" />
    </div>
  `;
}

function renderRoomEditorRow(room = {}, { imagePreviews = [] } = {}) {
  const id = escapeHtml(room.id);
  return `
    <div data-hotel-room-row="${id}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${escapeHtml(room.title || "Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${id}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      ${renderRoomImagesEditor(room, { imagePreviews })}
      <div class="grid grid-cols-2 gap-3">
        ${fieldMarkup({ id: `hotelRoomTitle_${id}`, label: "Emri i dhomës", value: room.title, placeholder: "Dhomë Deluxe me pamje nga deti" })}
        ${fieldMarkup({ id: `hotelRoomPrice_${id}`, label: "Çmimi / natë (€)", value: room.price == null ? "" : String(room.price), placeholder: "118", inputmode: "decimal" })}
        ${fieldMarkup({ id: `hotelRoomPersons_${id}`, label: "Persona", value: room.persons == null ? "" : String(room.persons), placeholder: "2", inputmode: "numeric" })}
        ${fieldMarkup({ id: `hotelRoomBeds_${id}`, label: "Krevate", value: room.beds, placeholder: "1 king" })}
        ${fieldMarkup({ id: `hotelRoomSize_${id}`, label: "Madhësia (m²)", value: room.size == null ? "" : String(room.size), placeholder: "31", inputmode: "numeric" })}
        ${fieldMarkup({ id: `hotelRoomTag_${id}`, label: "Etiketa (opsionale)", value: room.tag, placeholder: "Më e zgjedhura" })}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${id}" name="hotelRoomDesc_${id}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(room.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${id}" type="checkbox" ${room.active !== false ? "checked" : ""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `;
}

// Auswahl, was die Qendrimi-Sektion der Detailseite zeigt: Dhomat oder Oferta.
// Oferta ist nur waehlbar, wenn es Oferta-Eintraege gibt.
function renderStaySectionChoice({ staySection = "", hasOffers = false } = {}) {
  const current = normalizeHotelStaySectionCore(staySection);
  const option = (value, label, disabled = false) => {
    const active = current === value;
    return `
      <button type="button" data-hotel-stay-section-choice="${value}" ${disabled ? "disabled" : ""} class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "bg-slate-900 text-white shadow" : "bg-white text-slate-500 border border-slate-100"} ${disabled ? "opacity-40" : "active:scale-95"}">
        ${escapeHtml(label)}
      </button>
    `;
  };
  return `
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div>
        <p class="text-xs font-black text-slate-800">Seksioni te detajet</p>
        <p class="text-[10px] font-bold text-slate-400">Zgjidh çka shfaqet te detajet e hotelit: Dhomat ose Oferta.</p>
      </div>
      <div class="flex gap-2">
        ${option(HOTEL_STAY_SECTION_ROOMS, "Dhomat")}
        ${option(HOTEL_STAY_SECTION_OFFERS, "Oferta", !hasOffers)}
      </div>
      ${hasOffers ? "" : `<p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Shto së pari një Oferta për ta zgjedhur</p>`}
    </div>
  `;
}

/**
 * Dhomat-Editor fuer den Hotel-Admin: uncontrolled Inputs pro Zimmer, IDs sind
 * an die Room-ID gebunden; die Bindings lesen den Stand vor jeder Aktion aus
 * dem DOM zurueck (gleiche Mechanik wie der Hotel-Card-Editor).
 */
export function renderHotelRoomsEditorSection({
  restaurantId = "",
  record = {},
  editorState = {},
  hasOffers = false
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) return "";
  const editorMatches = asText(editorState.restaurantId) === safeRestaurantId;
  const rooms = editorMatches && Array.isArray(editorState.rooms)
    ? normalizeHotelRoomsCore(editorState.rooms)
    : normalizeHotelRoomsCore(record?.hotelRooms);
  const imagePreviews = editorMatches && editorState.imagePreviews && typeof editorState.imagePreviews === "object"
    ? editorState.imagePreviews
    : {};
  const saving = editorMatches && editorState.saving === true;
  const status = editorMatches ? asText(editorState.status) : "";
  const staySection = editorMatches && asText(editorState.staySection)
    ? editorState.staySection
    : record?.hotelStaySection;
  return `
    <div data-hotel-rooms-editor="${escapeHtml(safeRestaurantId)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${renderStaySectionChoice({ staySection, hasOffers })}
      ${rooms.length
        ? `<div class="space-y-4">${rooms.map((room) => renderRoomEditorRow(room, { imagePreviews: imagePreviews[room.id] })).join("")}</div>`
        : `<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>`}
      ${status ? `<p class="text-[10px] font-black uppercase tracking-widest ${status.includes("ruajt") ? "text-emerald-600" : "text-slate-500"}">${escapeHtml(status)}</p>` : ""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${saving ? "disabled" : ""}>
        ${saving ? "Po ruhen..." : "Ruaj Dhomat"}
      </button>
    </div>
  `;
}
