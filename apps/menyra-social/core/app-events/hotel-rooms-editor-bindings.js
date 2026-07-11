import {
  MAX_HOTEL_ROOM_IMAGES,
  createHotelRoomIdCore,
  normalizeHotelRoomsCore
} from "../profile/hotel-rooms-utils.js";
import {
  normalizeHotelStaySectionCore
} from "../profile/hotel-stay-section-utils.js";

export const HOTEL_ROOMS_EDITOR_BINDINGS_VERSION = "hotel-rooms-editor-bindings.v2";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function asUrlList(value = []) {
  return (Array.isArray(value) ? value : [])
    .map(asText)
    .filter(Boolean);
}

/**
 * Bindings fuer den Dhomat-Editor. Wird lazy importiert, sobald
 * [data-hotel-rooms-editor] im DOM steht (nur Hotel-Admin-Ansicht).
 * Uncontrolled Inputs: vor jeder Aktion wird der Stand aus dem DOM gelesen,
 * damit ein Re-Render keine Eingaben verliert.
 */
export function bindHotelRoomsEditorEvents({
  documentObj,
  state,
  renderFn,
  setDocFn,
  docFn,
  db,
  serverTimestampFn,
  uploadCompressedImageFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const editorRoot = doc.querySelector("[data-hotel-rooms-editor]");
  if (!editorRoot || editorRoot.dataset.hotelRoomsBound === "1") return;
  editorRoot.dataset.hotelRoomsBound = "1";
  const restaurantId = asText(editorRoot.getAttribute("data-hotel-rooms-editor"));
  if (!restaurantId) return;
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const setDoc = typeof setDocFn === "function" ? setDocFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const uploadCompressedImage = typeof uploadCompressedImageFn === "function" ? uploadCompressedImageFn : null;

  function ensureEditorState() {
    const current = state.hotelRoomsEditor && typeof state.hotelRoomsEditor === "object"
      ? state.hotelRoomsEditor
      : {};
    if (asText(current.restaurantId) !== restaurantId) {
      return { restaurantId, rooms: null, imageFiles: {}, imagePreviews: {}, saving: false, status: "", staySection: "" };
    }
    return {
      restaurantId,
      rooms: Array.isArray(current.rooms) ? current.rooms : null,
      imageFiles: current.imageFiles && typeof current.imageFiles === "object" ? current.imageFiles : {},
      imagePreviews: current.imagePreviews && typeof current.imagePreviews === "object" ? current.imagePreviews : {},
      saving: current.saving === true,
      status: asText(current.status),
      staySection: asText(current.staySection)
    };
  }

  function readValue(id = "") {
    const node = doc.getElementById(id);
    return node ? String(node.value || "") : "";
  }

  // Bestehende Galerie-URLs pro Zimmer aus dem Hidden-Input (Zeile = URL).
  function readRoomImages(roomId = "") {
    return asUrlList(readValue(`hotelRoomImagesData_${roomId}`).split("\n"));
  }

  function readRoomsFromDom() {
    return Array.from(doc.querySelectorAll("[data-hotel-room-row]")).map((row) => {
      const roomId = asText(row.getAttribute("data-hotel-room-row"));
      const activeNode = doc.getElementById(`hotelRoomActive_${roomId}`);
      const images = readRoomImages(roomId);
      return {
        id: roomId,
        title: readValue(`hotelRoomTitle_${roomId}`).trim(),
        price: readValue(`hotelRoomPrice_${roomId}`).trim(),
        persons: readValue(`hotelRoomPersons_${roomId}`).trim(),
        beds: readValue(`hotelRoomBeds_${roomId}`).trim(),
        size: readValue(`hotelRoomSize_${roomId}`).trim(),
        tag: readValue(`hotelRoomTag_${roomId}`).trim(),
        description: readValue(`hotelRoomDesc_${roomId}`).trim(),
        images,
        imageUrl: images[0] || "",
        active: activeNode && "checked" in activeNode ? !!activeNode.checked : true
      };
    });
  }

  function patchEditorState(patch = {}) {
    state.hotelRoomsEditor = { ...ensureEditorState(), ...patch };
  }

  function roomFiles(editorState, roomId) {
    const entry = editorState.imageFiles?.[roomId];
    if (Array.isArray(entry)) return entry.filter(Boolean);
    return entry ? [entry] : [];
  }

  // Previews bewusst NICHT filtern: der Index muss zu imageFiles passen.
  function roomPreviews(editorState, roomId) {
    const entry = editorState.imagePreviews?.[roomId];
    const list = Array.isArray(entry) ? entry : (entry ? [entry] : []);
    return list.map(asText);
  }

  function revokePreviewUrl(url = "") {
    const safe = asText(url);
    if (!safe.startsWith("blob:")) return;
    try {
      doc.defaultView?.URL?.revokeObjectURL?.(safe);
    } catch {}
  }

  // Lokalen App-Zustand aktualisieren, damit die Detailseite die Zimmer sofort
  // ohne Neuladen zeigt.
  function updateLocalRecords(payload = {}) {
    const matches = (row = {}) => [row?.id, row?.restaurantId, row?.canonicalRestaurantId, row?.landingRestaurantId]
      .some((value) => asText(value) === restaurantId);
    if (Array.isArray(state.restaurants)) {
      state.restaurants = state.restaurants.map((row) => (matches(row) ? { ...row, ...payload } : row));
    }
    if (state.userProfile && matches(state.userProfile)) {
      state.userProfile = { ...state.userProfile, ...payload };
    }
    if (state.profileView?.profile && matches(state.profileView.profile)) {
      state.profileView = {
        ...state.profileView,
        profile: { ...state.profileView.profile, ...payload }
      };
    }
  }

  async function saveRooms() {
    if (state.hotelRoomsEditor?.saving === true) return;
    if (!setDoc || !makeDocRef || !db) return;
    const editorState = ensureEditorState();
    const domRooms = readRoomsFromDom();
    patchEditorState({ rooms: domRooms, saving: true, status: "Po ruhen..." });
    render();
    try {
      const roomsWithImages = [];
      for (const room of domRooms) {
        const existingImages = asUrlList(room.images);
        const files = roomFiles(editorState, room.id);
        const uploadedUrls = [];
        for (const file of files) {
          if (existingImages.length + uploadedUrls.length >= MAX_HOTEL_ROOM_IMAGES) break;
          if (!uploadCompressedImage) throw new Error("Ngarkimi i fotos nuk eshte gati.");
          const uploaded = await uploadCompressedImage(file, restaurantId, {
            maxSize: 1080,
            quality: 0.8,
            mimeType: "image/jpeg"
          });
          const uploadedUrl = asText(uploaded?.cdnUrl || uploaded?.url);
          if (!uploadedUrl) throw new Error("Ngarkimi nuk dha URL te fotos.");
          uploadedUrls.push(uploadedUrl);
        }
        const images = [...existingImages, ...uploadedUrls].slice(0, MAX_HOTEL_ROOM_IMAGES);
        roomsWithImages.push({ ...room, images, imageUrl: images[0] || "" });
      }
      const hotelRooms = normalizeHotelRoomsCore(roomsWithImages).filter((room) => room.title);
      const payload = { hotelRooms, updatedAt: serverTimestamp() };
      await setDoc(makeDocRef(db, "restaurants", restaurantId), payload, { merge: true });
      updateLocalRecords({ hotelRooms });
      Object.values(ensureEditorState().imagePreviews || {}).forEach((entry) => {
        (Array.isArray(entry) ? entry : [entry]).forEach(revokePreviewUrl);
      });
      state.hotelRoomsEditor = {
        restaurantId,
        rooms: hotelRooms,
        imageFiles: {},
        imagePreviews: {},
        saving: false,
        status: "Dhomat u ruajten.",
        staySection: ensureEditorState().staySection
      };
      render();
    } catch (err) {
      console.error(err);
      patchEditorState({ rooms: domRooms, saving: false, status: err?.message || "Dhomat nuk u ruajten." });
      render();
    }
  }

  // Auswahl "Dhomat vs. Oferta" fuer die Detailseiten-Sektion: wird sofort
  // gespeichert, unabhaengig vom "Ruaj Dhomat"-Button.
  async function saveStaySection(nextSection = "") {
    if (!setDoc || !makeDocRef || !db) return;
    const staySection = normalizeHotelStaySectionCore(nextSection);
    patchEditorState({ rooms: readRoomsFromDom(), staySection, status: "" });
    render();
    try {
      await setDoc(makeDocRef(db, "restaurants", restaurantId), {
        hotelStaySection: staySection,
        updatedAt: serverTimestamp()
      }, { merge: true });
      updateLocalRecords({ hotelStaySection: staySection });
    } catch (err) {
      console.error(err);
      patchEditorState({ status: "Zgjedhja nuk u ruajt." });
      render();
    }
  }

  doc.querySelectorAll("[data-hotel-stay-section-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = asText(btn.getAttribute("data-hotel-stay-section-choice"));
      if (!choice || btn.disabled) return;
      void saveStaySection(choice);
    });
  });

  const addBtn = doc.getElementById("hotelRoomAddBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const rooms = readRoomsFromDom();
      rooms.push({ id: createHotelRoomIdCore(), active: true });
      patchEditorState({ rooms, status: "" });
      render();
    });
  }

  doc.querySelectorAll("[data-hotel-room-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const roomId = asText(btn.getAttribute("data-hotel-room-remove"));
      const editorState = ensureEditorState();
      const imageFiles = { ...editorState.imageFiles };
      const imagePreviews = { ...editorState.imagePreviews };
      roomPreviews(editorState, roomId).forEach(revokePreviewUrl);
      delete imageFiles[roomId];
      delete imagePreviews[roomId];
      patchEditorState({
        rooms: readRoomsFromDom().filter((room) => room.id !== roomId),
        imageFiles,
        imagePreviews,
        status: ""
      });
      render();
    });
  });

  // Einzelnes Foto entfernen: "existing" loescht die gespeicherte URL aus dem
  // Zimmer, "new" verwirft Datei + lokale Vorschau vor dem Upload.
  doc.querySelectorAll("[data-hotel-room-image-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const roomId = asText(btn.getAttribute("data-hotel-room-image-remove"));
      const index = Number(btn.getAttribute("data-hotel-room-image-index"));
      const source = asText(btn.getAttribute("data-hotel-room-image-source"));
      if (!roomId || !Number.isFinite(index)) return;
      const editorState = ensureEditorState();
      const rooms = readRoomsFromDom();
      if (source === "existing") {
        const room = rooms.find((entry) => entry.id === roomId);
        if (room) {
          room.images = asUrlList(room.images).filter((_, i) => i !== index);
          room.imageUrl = room.images[0] || "";
        }
        patchEditorState({ rooms, status: "" });
      } else {
        const files = roomFiles(editorState, roomId).filter((_, i) => i !== index);
        const previews = roomPreviews(editorState, roomId);
        revokePreviewUrl(previews[index]);
        const nextPreviews = previews.filter((_, i) => i !== index);
        patchEditorState({
          rooms,
          imageFiles: { ...editorState.imageFiles, [roomId]: files },
          imagePreviews: { ...editorState.imagePreviews, [roomId]: nextPreviews },
          status: ""
        });
      }
      render();
    });
  });

  doc.querySelectorAll("[data-hotel-room-image-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const roomId = asText(btn.getAttribute("data-hotel-room-image-trigger"));
      doc.getElementById(`hotelRoomImageInput_${roomId}`)?.click?.();
    });
  });

  doc.querySelectorAll("[data-hotel-room-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const roomId = asText(input.getAttribute("data-hotel-room-image-input"));
      const files = Array.from(input.files || [])
        .filter((entry) => entry && String(entry.type || "").startsWith("image/"));
      if (!roomId || !files.length) return;
      const editorState = ensureEditorState();
      const rooms = readRoomsFromDom();
      const existingCount = asUrlList(rooms.find((entry) => entry.id === roomId)?.images).length;
      const currentFiles = roomFiles(editorState, roomId);
      const currentPreviews = roomPreviews(editorState, roomId);
      const freeSlots = Math.max(0, MAX_HOTEL_ROOM_IMAGES - existingCount - currentFiles.length);
      const accepted = files.slice(0, freeSlots);
      const newPreviews = accepted.map((file) => {
        try {
          return doc.defaultView?.URL?.createObjectURL ? doc.defaultView.URL.createObjectURL(file) : "";
        } catch {
          return "";
        }
      });
      // Files und Previews bleiben index-synchron (Entfernen per Index).
      patchEditorState({
        rooms,
        imageFiles: { ...editorState.imageFiles, [roomId]: [...currentFiles, ...accepted] },
        imagePreviews: { ...editorState.imagePreviews, [roomId]: [...currentPreviews, ...newPreviews] },
        status: accepted.length < files.length ? `Maksimumi ${MAX_HOTEL_ROOM_IMAGES} foto për dhomë.` : ""
      });
      try { input.value = ""; } catch {}
      render();
    });
  });

  const saveBtn = doc.getElementById("hotelRoomsSaveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      void saveRooms();
    });
  }
}
