import {
  createHotelRoomIdCore,
  normalizeHotelRoomsCore
} from "../profile/hotel-rooms-utils.js";

export const HOTEL_ROOMS_EDITOR_BINDINGS_VERSION = "hotel-rooms-editor-bindings.v1";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
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
      return { restaurantId, rooms: null, imageFiles: {}, imagePreviews: {}, saving: false, status: "" };
    }
    return {
      restaurantId,
      rooms: Array.isArray(current.rooms) ? current.rooms : null,
      imageFiles: current.imageFiles && typeof current.imageFiles === "object" ? current.imageFiles : {},
      imagePreviews: current.imagePreviews && typeof current.imagePreviews === "object" ? current.imagePreviews : {},
      saving: current.saving === true,
      status: asText(current.status)
    };
  }

  function readValue(id = "") {
    const node = doc.getElementById(id);
    return node ? String(node.value || "") : "";
  }

  function readRoomsFromDom() {
    return Array.from(doc.querySelectorAll("[data-hotel-room-row]")).map((row) => {
      const roomId = asText(row.getAttribute("data-hotel-room-row"));
      const activeNode = doc.getElementById(`hotelRoomActive_${roomId}`);
      return {
        id: roomId,
        title: readValue(`hotelRoomTitle_${roomId}`).trim(),
        price: readValue(`hotelRoomPrice_${roomId}`).trim(),
        persons: readValue(`hotelRoomPersons_${roomId}`).trim(),
        beds: readValue(`hotelRoomBeds_${roomId}`).trim(),
        size: readValue(`hotelRoomSize_${roomId}`).trim(),
        tag: readValue(`hotelRoomTag_${roomId}`).trim(),
        description: readValue(`hotelRoomDesc_${roomId}`).trim(),
        imageUrl: readValue(`hotelRoomImageUrl_${roomId}`).trim(),
        active: activeNode && "checked" in activeNode ? !!activeNode.checked : true
      };
    });
  }

  function patchEditorState(patch = {}) {
    state.hotelRoomsEditor = { ...ensureEditorState(), ...patch };
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
      const imageFiles = editorState.imageFiles || {};
      const roomsWithImages = [];
      for (const room of domRooms) {
        let imageUrl = asText(room.imageUrl);
        const file = imageFiles[room.id] || null;
        if (file) {
          if (!uploadCompressedImage) throw new Error("Ngarkimi i fotos nuk eshte gati.");
          const uploaded = await uploadCompressedImage(file, restaurantId, {
            maxSize: 1080,
            quality: 0.8,
            mimeType: "image/jpeg"
          });
          const uploadedUrl = asText(uploaded?.cdnUrl || uploaded?.url);
          if (!uploadedUrl) throw new Error("Ngarkimi nuk dha URL te fotos.");
          imageUrl = uploadedUrl;
        }
        roomsWithImages.push({ ...room, imageUrl });
      }
      const hotelRooms = normalizeHotelRoomsCore(roomsWithImages).filter((room) => room.title);
      const payload = { hotelRooms, updatedAt: serverTimestamp() };
      await setDoc(makeDocRef(db, "restaurants", restaurantId), payload, { merge: true });
      updateLocalRecords({ hotelRooms });
      state.hotelRoomsEditor = {
        restaurantId,
        rooms: hotelRooms,
        imageFiles: {},
        imagePreviews: {},
        saving: false,
        status: "Dhomat u ruajten."
      };
      render();
    } catch (err) {
      console.error(err);
      patchEditorState({ rooms: domRooms, saving: false, status: err?.message || "Dhomat nuk u ruajten." });
      render();
    }
  }

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

  doc.querySelectorAll("[data-hotel-room-image-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const roomId = asText(btn.getAttribute("data-hotel-room-image-trigger"));
      doc.getElementById(`hotelRoomImageInput_${roomId}`)?.click?.();
    });
  });

  doc.querySelectorAll("[data-hotel-room-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const roomId = asText(input.getAttribute("data-hotel-room-image-input"));
      const file = Array.from(input.files || []).find((entry) => entry && String(entry.type || "").startsWith("image/")) || null;
      if (!roomId || !file) return;
      const editorState = ensureEditorState();
      let previewUrl = "";
      try {
        previewUrl = doc.defaultView?.URL?.createObjectURL ? doc.defaultView.URL.createObjectURL(file) : "";
      } catch {}
      patchEditorState({
        rooms: readRoomsFromDom(),
        imageFiles: { ...editorState.imageFiles, [roomId]: file },
        imagePreviews: { ...editorState.imagePreviews, ...(previewUrl ? { [roomId]: previewUrl } : {}) },
        status: ""
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
