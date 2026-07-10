import {
  CEO_COUNTRIES,
  LEAD_COUNTRY_CENTERS,
  LEAD_SETTINGS_DEFAULT_COUNTRY,
  LEAD_TYPE_ORDER,
  PRISHTINA_COORDS
} from "../menyra-social/core/app-shell/social-app-domain-config.js";
import {
  normalizeSearchKeyCore as normalizeSearchKey
} from "../menyra-social/core/common/text-normalize-utils.js";
import {
  createCrmLeadGeoSupportRuntime
} from "../menyra-social/core/crm/crm-lead-geo-support-runtime.js";
import {
  ensureLeafletLoaded
} from "./heart-crm-admin-write-adapter.js";
import {
  renderHeartIcon
} from "./heart-icons.js";

export const HEART_DESTINATION_LOCATION_PICKER_VERSION = "heart-destination-location-picker.v1";

const PICKER_MODAL_ID = "heartDestPickerModal";
const PICKER_MAP_ID = "heartDestPickerMap";
const PICKER_TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

function asText(value = "") {
  return String(value || "").trim();
}

function normalizeCoords(value = null) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

let destinationGeoRuntime = null;

function getDestinationGeoRuntime() {
  if (destinationGeoRuntime) return destinationGeoRuntime;
  destinationGeoRuntime = createCrmLeadGeoSupportRuntime({
    state: null,
    constants: {
      ceoCountries: CEO_COUNTRIES,
      defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
      countryCenters: LEAD_COUNTRY_CENTERS,
      defaultCenter: PRISHTINA_COORDS,
      leadTypeOrder: LEAD_TYPE_ORDER
    },
    utilityApi: {
      normalizeSearchKeyFn: normalizeSearchKey,
      fetchFn: typeof fetch === "function" ? fetch.bind(globalThis) : null
    }
  });
  return destinationGeoRuntime;
}

// Loest wie beim Lead-Standort Plus Codes (voll/kurz) oder freie Adressen zu
// Koordinaten auf. Gibt null zurueck, wenn nichts aufgeloest werden kann.
export async function resolveDestinationCoordsFromText(value = "") {
  const text = asText(value);
  if (!text) return null;
  const geo = getDestinationGeoRuntime();
  let coords = null;
  try {
    coords = await geo.parseCoordsFromAddressInputAsync(text, null);
  } catch {
    coords = null;
  }
  if (!coords) {
    try {
      coords = await geo.geocodeReferenceSearch(text);
    } catch {
      coords = null;
    }
  }
  return normalizeCoords(coords);
}

function ensurePickerModal(documentObj) {
  let modal = documentObj.getElementById(PICKER_MODAL_ID);
  if (modal) return modal;
  modal = documentObj.createElement("div");
  modal.id = PICKER_MODAL_ID;
  modal.className = "heart-dest-picker heart-dest-picker--hidden";
  modal.innerHTML = `
    <div class="heart-dest-picker__overlay" data-dest-picker-cancel="true"></div>
    <div class="heart-dest-picker__panel">
      <div class="heart-dest-picker__head">
        <div>
          <h3>Standort anpassen</h3>
          <p>Verschiebe die Karte unter den Pin</p>
        </div>
        <button type="button" class="heart-dest-picker__close" data-dest-picker-cancel="true" aria-label="Schliessen">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-dest-picker__map-wrap">
        <div id="${PICKER_MAP_ID}" class="heart-dest-picker__map"></div>
        <div class="heart-dest-picker__pin" aria-hidden="true">
          <div class="heart-dest-picker__pin-head">${renderHeartIcon("mapPin")}</div>
          <div class="heart-dest-picker__pin-stem"></div>
        </div>
      </div>
      <div class="heart-dest-picker__foot">
        <button type="button" class="heart-dest-picker__confirm" data-dest-picker-confirm="true">${renderHeartIcon("checkCircle")} Hier bestaetigen</button>
      </div>
    </div>
  `;
  documentObj.body.appendChild(modal);
  return modal;
}

// Eigener kleiner Pin-Picker fuer Destination-Orte im Heart. Bewusst getrennt
// vom Social-CRM-Picker (#locationPickerModal), damit sich die Confirm-Handler
// der beiden Flows nie gegenseitig Lead-State ueberschreiben.
export function createHeartDestinationLocationPicker({
  documentObj = typeof document === "undefined" ? null : document,
  windowObj = typeof window === "undefined" ? null : window,
  ensureLeafletLoadedFn = ensureLeafletLoaded
} = {}) {
  let pickerMap = null;
  let activeResolve = null;

  function closePicker(result = null) {
    const modal = documentObj?.getElementById(PICKER_MODAL_ID);
    modal?.classList.add("heart-dest-picker--hidden");
    const resolve = activeResolve;
    activeResolve = null;
    if (typeof resolve === "function") resolve(result);
  }

  function confirmPicker() {
    if (!pickerMap) {
      closePicker(null);
      return;
    }
    const center = pickerMap.getCenter();
    closePicker(normalizeCoords({ lat: center?.lat, lng: center?.lng }));
  }

  function bindPickerEvents(modal) {
    if (!modal || modal.dataset.bound === "true") return;
    modal.addEventListener("click", (event) => {
      if (event.target?.closest?.("[data-dest-picker-confirm]")) {
        confirmPicker();
        return;
      }
      if (event.target?.closest?.("[data-dest-picker-cancel]")) {
        closePicker(null);
      }
    });
    modal.dataset.bound = "true";
  }

  async function open({ initialCoords = null } = {}) {
    if (!documentObj || !windowObj) return null;
    const leafletReady = await ensureLeafletLoadedFn();
    if (!leafletReady || !windowObj.L) {
      throw new Error("Kartenbibliothek konnte nicht geladen werden.");
    }
    const modal = ensurePickerModal(documentObj);
    bindPickerEvents(modal);
    // Falls ein vorheriger open()-Aufruf noch offen ist, sauber abbrechen.
    if (typeof activeResolve === "function") closePicker(null);
    modal.classList.remove("heart-dest-picker--hidden");

    if (pickerMap && !documentObj.getElementById(PICKER_MAP_ID)?.hasChildNodes()) {
      pickerMap.remove();
      pickerMap = null;
    }
    if (!pickerMap) {
      pickerMap = windowObj.L.map(PICKER_MAP_ID, { zoomControl: false, attributionControl: false });
      windowObj.L.tileLayer(PICKER_TILE_URL, { maxZoom: 19 }).addTo(pickerMap);
    }
    const target = normalizeCoords(initialCoords) || PRISHTINA_COORDS;
    pickerMap.setView([target.lat, target.lng], normalizeCoords(initialCoords) ? 17 : 13, { animate: false });
    windowObj.setTimeout(() => pickerMap?.invalidateSize(), 250);

    return new Promise((resolve) => {
      activeResolve = resolve;
    });
  }

  return Object.freeze({
    version: HEART_DESTINATION_LOCATION_PICKER_VERSION,
    open
  });
}
