import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatRelative
} from "./heart-ui-utils.js";
import {
  DESTINATION_PLACE_CATEGORIES,
  DESTINATION_PLACE_SEASONS,
  createDestinationPlaceIdCore,
  normalizeDestinationPayloadCore,
  normalizeDestinationPlaceCore
} from "../menyra-social/core/destinations/destination-template-core.js";
import {
  formatDistanceLabelCore,
  formatTravelLabelCore,
  hasFiniteCoordsCore
} from "../menyra-social/core/destinations/destination-distance-core.js";
import {
  groupDestinationPlacesByCategoryCore,
  normalizeDestinationOverridesCore,
  resolveLeadDestinationPlacesCore,
  serializeDestinationOverridesCore
} from "../menyra-social/core/destinations/destination-merge-core.js";

export const HEART_DESTINATIONS_RENDER_VERSION = "heart-destinations-render.v1";

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function renderStateBlock(label = "", tone = "neutral") {
  return `<div class="heart-crm-state heart-crm-state--${escapeHtml(tone)}">${escapeHtml(label)}</div>`;
}

function categoryLabelDe(categoryKey = "") {
  return DESTINATION_PLACE_CATEGORIES.find((category) => category.key === categoryKey)?.labelDe || categoryKey;
}

// ---------------------------------------------------------------------------
// Destinations-Liste
// ---------------------------------------------------------------------------

function renderDestinationStatusChip(destination = {}) {
  if (!destination.hasPublished) {
    return `<span class="heart-crm-chip heart-crm-chip--warning heart-crm-status-pill">Nur Entwurf</span>`;
  }
  return `<span class="heart-crm-chip heart-crm-chip--success heart-crm-status-pill">Veroeffentlicht v${escapeHtml(String(destination.publishedVersion || 1))}</span>`;
}

function renderDestinationCard(destination = {}) {
  const placeCount = Array.isArray(destination.draft?.places) ? destination.draft.places.length : 0;
  const activeCount = (destination.draft?.places || []).filter((place) => place.active !== false).length;
  const updatedLabel = destination.draftUpdatedAt ? formatRelative(destination.draftUpdatedAt) : "";
  return `
    <article class="heart-crm-card heart-destination-card">
      <div class="heart-crm-card-head">
        <div class="heart-crm-avatar" aria-hidden="true"><span>${renderHeartIcon("mapPin")}</span></div>
        <div class="heart-crm-card-main">
          <p class="heart-crm-card-title">${escapeHtml(destination.name || "Destination")}</p>
          <p class="heart-crm-card-meta">${escapeHtml(`${activeCount} aktive Orte · ${placeCount} gesamt`)}${updatedLabel ? escapeHtml(` · ${updatedLabel}`) : ""}</p>
        </div>
        ${renderDestinationStatusChip(destination)}
      </div>
      <div class="heart-crm-action-row">
        <button type="button" class="heart-crm-action-placeholder heart-crm-action-placeholder--primary" data-action="open-destination-editor" data-destination-id="${escapeHtml(destination.id)}">Bearbeiten</button>
        <button type="button" class="heart-crm-action-placeholder" data-action="publish-destination" data-destination-id="${escapeHtml(destination.id)}">Veroeffentlichen</button>
      </div>
    </article>
  `;
}

function renderDestinationsList(destinations = {}) {
  const items = Array.isArray(destinations.items) ? destinations.items : [];
  const status = asText(destinations.status);
  return `
    <section class="heart-crm-social-view heart-crm-social-view--destinations">
      <div class="heart-crm-social-head">
        <div>
          <span class="heart-crm-social-eyebrow">Heart</span>
          <h2>Orte & Destinationen</h2>
        </div>
        <div class="heart-crm-header-actions">
          <button type="button" class="heart-crm-icon-button" data-action="open-destination-editor" title="Neue Destination">${renderHeartIcon("plus")}</button>
        </div>
      </div>
      <p class="heart-destination-intro">Templates fuer Velipoje, Shengjin, Durres usw. Einmal pflegen, bei jedem Hotel-Lead wiederverwenden. Entfernungen werden pro Hotel automatisch berechnet.</p>
      ${status === "error" ? renderStateBlock(destinations.error || "Destinationen konnten nicht geladen werden.", "danger") : ""}
      ${status === "loading" && !items.length ? renderStateBlock("Destinationen werden geladen...", "neutral") : ""}
      ${status === "ready" && !items.length ? renderStateBlock("Noch keine Destination. Lege mit + die erste an (z. B. Velipoje).", "neutral") : ""}
      <div class="heart-crm-list-stack">
        ${items.map((destination) => renderDestinationCard(destination)).join("")}
      </div>
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Destination-Editor (Entwurf)
// ---------------------------------------------------------------------------

function renderPlaceEditorRow(place = {}) {
  const id = escapeHtml(place.id);
  const categoryOptions = DESTINATION_PLACE_CATEGORIES
    .map((category) => `<option value="${escapeHtml(category.key)}" ${place.category === category.key ? "selected" : ""}>${escapeHtml(category.labelDe)}</option>`)
    .join("");
  const seasonOptions = DESTINATION_PLACE_SEASONS
    .map((season) => `<option value="${escapeHtml(season.key)}" ${place.season === season.key ? "selected" : ""}>${escapeHtml(season.labelDe)}</option>`)
    .join("");
  return `
    <div class="heart-destination-place" data-destination-place="${id}">
      <div class="heart-destination-place__head">
        <span class="heart-destination-place__title">${escapeHtml(place.name || "Neuer Ort")}</span>
        <button type="button" class="heart-crm-footer-icon" data-action="remove-destination-place" data-place-id="${id}" aria-label="Ort entfernen">${renderHeartIcon("trash")}</button>
      </div>
      <div class="heart-crm-modal-grid">
        <label class="heart-crm-modal-field">
          <span>Name</span>
          <input id="destPlaceName_${id}" name="destPlaceName_${id}" type="text" value="${escapeHtml(place.name)}" placeholder="Plazhi i Velipojes" />
        </label>
        <label class="heart-crm-modal-field">
          <span>Kategorie</span>
          <select id="destPlaceCategory_${id}" name="destPlaceCategory_${id}">${categoryOptions}</select>
        </label>
        <label class="heart-crm-modal-field heart-crm-modal-field--wide">
          <span>Kurzbeschreibung</span>
          <textarea id="destPlaceDesc_${id}" name="destPlaceDesc_${id}" placeholder="Kurze Beschreibung fuer die Hotelseite...">${escapeHtml(place.description)}</textarea>
        </label>
        <label class="heart-crm-modal-field">
          <span>Latitude</span>
          <input id="destPlaceLat_${id}" name="destPlaceLat_${id}" type="text" inputmode="decimal" value="${place.lat == null ? "" : escapeHtml(String(place.lat))}" placeholder="41.8734" />
        </label>
        <label class="heart-crm-modal-field">
          <span>Longitude</span>
          <input id="destPlaceLng_${id}" name="destPlaceLng_${id}" type="text" inputmode="decimal" value="${place.lng == null ? "" : escapeHtml(String(place.lng))}" placeholder="19.4231" />
        </label>
        <label class="heart-crm-modal-field heart-crm-modal-field--wide">
          <span>Titelbild URL</span>
          <input id="destPlaceCover_${id}" name="destPlaceCover_${id}" type="text" value="${escapeHtml(place.coverImageUrl)}" placeholder="https://..." />
        </label>
        <label class="heart-crm-modal-field heart-crm-modal-field--wide">
          <span>Galerie URLs (eine pro Zeile, optional)</span>
          <textarea id="destPlaceGallery_${id}" name="destPlaceGallery_${id}" placeholder="https://...">${escapeHtml((place.gallery || []).join("\n"))}</textarea>
        </label>
        <label class="heart-crm-modal-field">
          <span>Prioritaet (0-100)</span>
          <input id="destPlacePriority_${id}" name="destPlacePriority_${id}" type="number" min="0" max="100" step="1" value="${escapeHtml(String(place.priority ?? 0))}" />
        </label>
        <label class="heart-crm-modal-field">
          <span>Saison</span>
          <select id="destPlaceSeason_${id}" name="destPlaceSeason_${id}">${seasonOptions}</select>
        </label>
        <label class="heart-crm-modal-field heart-crm-modal-field--checkbox">
          <span>Immer zuerst zeigen</span>
          <input id="destPlacePinned_${id}" name="destPlacePinned_${id}" type="checkbox" ${place.pinned ? "checked" : ""} />
        </label>
        <label class="heart-crm-modal-field heart-crm-modal-field--checkbox">
          <span>Aktiv</span>
          <input id="destPlaceActive_${id}" name="destPlaceActive_${id}" type="checkbox" ${place.active !== false ? "checked" : ""} />
        </label>
      </div>
    </div>
  `;
}

function renderDestinationEditor(destinations = {}) {
  const editor = destinations.editor || {};
  const draft = normalizeDestinationPayloadCore(editor.draft || {});
  const isCreate = !asText(editor.destinationId);
  const destination = (destinations.items || []).find((item) => item.id === editor.destinationId) || null;
  const groups = DESTINATION_PLACE_CATEGORIES.map((category) => ({
    ...category,
    places: draft.places.filter((place) => place.category === category.key)
  }));
  const busy = editor.saving || editor.publishing || editor.deleting || editor.loading;
  return `
    <section class="heart-crm-inline-editor heart-crm-inline-editor--destination">
      <div class="heart-modal__header">
        <div>
          <p class="heart-page-header__eyebrow">Orte & Destinationen</p>
          <h2>${escapeHtml(isCreate ? "Neue Destination" : `${draft.name || "Destination"} bearbeiten`)}</h2>
        </div>
        <button class="heart-icon-button" data-action="close-destination-editor" aria-label="Zurueck">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-crm-modal-body">
        ${destination ? `<div class="heart-crm-chip-row">${renderDestinationStatusChip(destination)}</div>` : ""}
        ${editor.loading ? renderStateBlock("Destination wird geladen...", "neutral") : `
          <section class="heart-crm-modal-fieldset">
            <p>Destination</p>
            <div class="heart-crm-modal-grid">
              <label class="heart-crm-modal-field">
                <span>Name</span>
                <input id="destName" name="destName" type="text" value="${escapeHtml(draft.name)}" placeholder="Velipoje" />
              </label>
              <label class="heart-crm-modal-field heart-crm-modal-field--wide">
                <span>Beschreibung (optional)</span>
                <textarea id="destDescription" name="destDescription" placeholder="Kurzer Text ueber die Destination...">${escapeHtml(draft.description)}</textarea>
              </label>
            </div>
          </section>
          ${groups.map((group) => `
            <section class="heart-crm-modal-fieldset heart-destination-group">
              <div class="heart-crm-location-head">
                <p>${escapeHtml(group.labelDe)} (${group.places.length})</p>
                <button type="button" class="heart-crm-action-placeholder" data-action="add-destination-place" data-category="${escapeHtml(group.key)}">${renderHeartIcon("plus")} <span>Ort</span></button>
              </div>
              ${group.places.map((place) => renderPlaceEditorRow(place)).join("")}
            </section>
          `).join("")}
        `}
        ${editor.error ? renderStateBlock(editor.error, "danger") : ""}
        ${editor.status ? renderStateBlock(editor.status, "neutral") : ""}
      </div>
      <div class="heart-modal__footer heart-crm-modal-footer">
        ${isCreate ? "" : `<button class="heart-button heart-button--secondary" data-action="delete-destination" data-destination-id="${escapeHtml(editor.destinationId)}" type="button" ${busy ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(editor.deleting ? "Loeschen..." : "Loeschen")}</button>`}
        ${isCreate ? "" : `<button class="heart-button heart-button--secondary" data-action="publish-destination" data-destination-id="${escapeHtml(editor.destinationId)}" data-destination-from-editor="true" type="button" ${busy ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(editor.publishing ? "Veroeffentlichen..." : "Veroeffentlichen")}</button>`}
        <button class="heart-button heart-button--primary" data-action="save-destination-draft" type="button" ${busy ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(editor.saving ? "Speichern..." : "Entwurf speichern")}</button>
      </div>
    </section>
  `;
}

export function renderHeartDestinationsView(destinations = {}) {
  if (destinations?.editor?.open) return renderDestinationEditor(destinations);
  return renderDestinationsList(destinations || {});
}

// Liest den aktuellen Editor-Zustand aus dem DOM (uncontrolled Inputs) zurueck
// in einen Draft, bevor Aktionen wie speichern/Ort hinzufuegen neu rendern.
export function readDestinationDraftFromDom(currentDraft = {}, documentObj = typeof document === "undefined" ? null : document) {
  const draft = normalizeDestinationPayloadCore(currentDraft || {});
  if (!documentObj) return draft;
  const readValue = (id = "") => {
    const node = documentObj.getElementById(id);
    return node ? String(node.value || "") : null;
  };
  const readChecked = (id = "") => {
    const node = documentObj.getElementById(id);
    return node && "checked" in node ? !!node.checked : null;
  };
  const nameValue = readValue("destName");
  if (nameValue != null) draft.name = nameValue.trim();
  const descriptionValue = readValue("destDescription");
  if (descriptionValue != null) draft.description = descriptionValue.trim().slice(0, 600);
  draft.places = draft.places.map((place) => {
    const updated = { ...place };
    const name = readValue(`destPlaceName_${place.id}`);
    if (name != null) updated.name = name.trim();
    const category = readValue(`destPlaceCategory_${place.id}`);
    if (category != null) updated.category = category;
    const description = readValue(`destPlaceDesc_${place.id}`);
    if (description != null) updated.description = description.trim();
    const lat = readValue(`destPlaceLat_${place.id}`);
    if (lat != null) updated.lat = lat.trim() === "" ? null : Number(String(lat).replace(",", "."));
    const lng = readValue(`destPlaceLng_${place.id}`);
    if (lng != null) updated.lng = lng.trim() === "" ? null : Number(String(lng).replace(",", "."));
    const cover = readValue(`destPlaceCover_${place.id}`);
    if (cover != null) updated.coverImageUrl = cover.trim();
    const gallery = readValue(`destPlaceGallery_${place.id}`);
    if (gallery != null) {
      updated.gallery = gallery.split(/\n+/).map((entry) => entry.trim()).filter(Boolean);
    }
    const priority = readValue(`destPlacePriority_${place.id}`);
    if (priority != null) updated.priority = priority.trim() === "" ? 0 : Number(priority);
    const season = readValue(`destPlaceSeason_${place.id}`);
    if (season != null) updated.season = season;
    const pinned = readChecked(`destPlacePinned_${place.id}`);
    if (pinned != null) updated.pinned = pinned;
    const active = readChecked(`destPlaceActive_${place.id}`);
    if (active != null) updated.active = active;
    return normalizeDestinationPlaceCore(updated);
  });
  return draft;
}

export function createEmptyDestinationPlace(categoryKey = "nearby") {
  return normalizeDestinationPlaceCore({
    id: createDestinationPlaceIdCore(),
    category: categoryKey,
    active: true
  });
}

// ---------------------------------------------------------------------------
// Lead-Editor: Destination-Auswahl + Hotel-Abweichungen
// ---------------------------------------------------------------------------

function resolveLeadHotelCoords(lead = {}) {
  const primaryLocation = Array.isArray(lead.locations)
    ? lead.locations.find((location) => hasFiniteCoordsCore(location))
    : null;
  if (primaryLocation) return { lat: Number(primaryLocation.lat), lng: Number(primaryLocation.lng) };
  if (hasFiniteCoordsCore(lead)) return { lat: Number(lead.lat), lng: Number(lead.lng) };
  if (hasFiniteCoordsCore({ lat: lead.gpsLat, lng: lead.gpsLng })) {
    return { lat: Number(lead.gpsLat), lng: Number(lead.gpsLng) };
  }
  return null;
}

function renderLeadDestinationPlaceRow(place = {}) {
  const id = escapeHtml(place.id);
  const distanceLabel = formatDistanceLabelCore(place.distanceMeters);
  const travelLabel = formatTravelLabelCore(place.distanceMeters);
  const metaParts = [categoryLabelDe(place.category), distanceLabel, travelLabel].filter(Boolean);
  return `
    <div class="heart-lead-destination-place ${place.hidden ? "heart-lead-destination-place--hidden" : ""}">
      <div class="heart-lead-destination-place__main">
        <span class="heart-lead-destination-place__name">
          ${place.pinned ? `<span class="heart-lead-destination-place__pin">${renderHeartIcon("mapPin")}</span>` : ""}
          ${escapeHtml(place.name)}
        </span>
        <span class="heart-lead-destination-place__meta">${escapeHtml(metaParts.join(" · "))}</span>
      </div>
      <div class="heart-lead-destination-place__actions">
        <button type="button" class="heart-crm-action-placeholder ${place.pinnedRank != null ? "heart-crm-action-placeholder--primary" : ""}" data-action="toggle-lead-destination-pin" data-place-id="${id}" title="Immer zuerst zeigen">${place.pinnedRank != null ? "Fixiert" : "Fixieren"}</button>
        <button type="button" class="heart-crm-action-placeholder" data-action="toggle-lead-destination-visibility" data-place-id="${id}">${place.hidden ? "Einblenden" : "Ausblenden"}</button>
      </div>
    </div>
  `;
}

export function renderLeadDestinationFieldset(lead = {}, publishedState = {}) {
  const publishedItems = Array.isArray(publishedState.items) ? publishedState.items : [];
  const publishedStatus = asText(publishedState.status);
  const selectedId = asText(lead.destinationId);
  const overrides = normalizeDestinationOverridesCore(lead.destinationOverrides || {});
  const selected = publishedItems.find((item) => item.id === selectedId) || null;
  const hotelCoords = resolveLeadHotelCoords(lead);
  const options = [
    `<option value="">Keine Destination</option>`,
    ...publishedItems.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
  ].join("");

  let body = "";
  if (publishedStatus === "loading" && !publishedItems.length) {
    body = renderStateBlock("Destinationen werden geladen...", "neutral");
  } else if (publishedStatus === "error") {
    body = renderStateBlock(publishedState.error || "Destinationen konnten nicht geladen werden.", "danger");
  } else if (selectedId && !selected) {
    body = renderStateBlock("Die gespeicherte Destination ist nicht mehr veroeffentlicht.", "warning");
  } else if (selected) {
    const resolvedPlaces = resolveLeadDestinationPlacesCore({
      places: selected.places,
      overrides,
      hotelCoords,
      includeHidden: true
    });
    const visibleCount = resolvedPlaces.filter((place) => !place.hidden).length;
    const groups = groupDestinationPlacesByCategoryCore(resolvedPlaces);
    body = `
      ${hotelCoords ? "" : renderStateBlock("Noch kein Hotel-Pin gesetzt. Standort auf der Karte festlegen, damit Entfernungen automatisch berechnet werden.", "warning")}
      <p class="heart-lead-destination-summary">${escapeHtml(`${visibleCount} von ${resolvedPlaces.length} Orten sichtbar · Reihenfolge: Fixiert -> Prioritaet -> Naehe`)}</p>
      ${groups.map((group) => `
        <div class="heart-lead-destination-group">
          <p class="heart-lead-destination-group__title">${escapeHtml(group.labelDe)}</p>
          ${group.places.map((place) => renderLeadDestinationPlaceRow(place)).join("")}
        </div>
      `).join("")}
    `;
  } else if (!publishedItems.length) {
    body = renderStateBlock("Noch keine veroeffentlichte Destination. Unter Heart -> Orte anlegen und veroeffentlichen.", "neutral");
  }

  return `
    <section class="heart-crm-modal-fieldset heart-lead-destination">
      <p>Destination</p>
      <div class="heart-crm-modal-grid">
        <label class="heart-crm-modal-field heart-crm-modal-field--wide">
          <span>Ort / Template</span>
          <select id="leadDestinationSelect" name="leadDestinationSelect">${options}</select>
        </label>
      </div>
      <input type="hidden" id="leadDestinationId" value="${escapeHtml(selectedId)}" />
      <input type="hidden" id="leadDestinationName" value="${escapeHtml(selected?.name || asText(lead.destinationName))}" />
      <input type="hidden" id="leadDestinationOverrides" value="${escapeHtml(serializeDestinationOverridesCore(overrides))}" />
      ${body}
    </section>
  `;
}
