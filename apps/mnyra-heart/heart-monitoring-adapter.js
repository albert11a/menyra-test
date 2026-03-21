import {
  normalizeConnection,
  normalizeDashboardData,
  normalizeIncident
} from "./heart-test-report-normalizer.js";

export function createHeartMonitoringAdapter({ apiClient }) {
  async function loadDashboard() {
    const payload = await apiClient.request("heartGetDashboard");
    return normalizeDashboardData(payload.data || {});
  }

  async function loadIncidents() {
    const payload = await apiClient.request("heartGetIncidents");
    return {
      items: Array.isArray(payload.items) ? payload.items.map(normalizeIncident) : [],
      updatedAt: payload.updatedAt || new Date().toISOString()
    };
  }

  async function loadConnections() {
    const payload = await apiClient.request("heartGetConnections");
    return {
      items: Array.isArray(payload.items) ? payload.items.map(normalizeConnection) : [],
      updatedAt: payload.updatedAt || new Date().toISOString()
    };
  }

  async function deleteIncident(incidentId) {
    const payload = await apiClient.request("heartDeleteIncident", {
      method: "POST",
      body: { incidentId }
    });
    return normalizeIncident(payload.incident || {});
  }

  return {
    loadDashboard,
    loadIncidents,
    loadConnections,
    deleteIncident
  };
}
