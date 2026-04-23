import {
  normalizeSetupData
} from "./heart-test-report-normalizer.js";

export function createHeartSetupAdapter({ apiClient }) {
  async function loadSetup() {
    const payload = await apiClient.request("heartGetSetup");
    return normalizeSetupData(payload.setup || {});
  }

  async function saveSetup(patch = {}) {
    const payload = await apiClient.request("heartSaveSetup", {
      method: "POST",
      body: patch
    });
    return normalizeSetupData(payload.setup || {});
  }

  async function searchRestaurants(query = "") {
    const payload = await apiClient.request("heartSearchRestaurants", {
      method: "POST",
      body: { query }
    });
    return {
      query: String(query || "").trim(),
      items: Array.isArray(payload.items) ? payload.items.map((item) => ({
        id: String(item.id || "").trim(),
        name: String(item.name || item.restaurantName || "").trim(),
        handle: String(item.handle || "").trim(),
        ownerEmail: String(item.ownerEmail || "").trim(),
        city: String(item.city || "").trim(),
        guestRouteUrl: String(item.guestRouteUrl || "").trim()
      })) : []
    };
  }

  async function provisionPersonas(personas = [], setupPatch = {}) {
    const payload = await apiClient.request("heartProvisionAccounts", {
      method: "POST",
      body: {
        personas,
        ...setupPatch
      }
    });
    return normalizeSetupData(payload.setup || {});
  }

  async function deletePersona(personaKey = "") {
    const payload = await apiClient.request("heartDeleteProvisionedPersona", {
      method: "POST",
      body: { personaKey }
    });
    return normalizeSetupData(payload.setup || {});
  }

  return {
    loadSetup,
    saveSetup,
    searchRestaurants,
    provisionPersonas,
    deletePersona
  };
}
