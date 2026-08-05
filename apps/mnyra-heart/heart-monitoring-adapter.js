import {
  normalizeConnection
} from "./heart-test-report-normalizer.js";

export function createHeartMonitoringAdapter({ apiClient }) {
  async function loadConnections() {
    const payload = await apiClient.request("heartGetConnections");
    return {
      items: Array.isArray(payload.items) ? payload.items.map(normalizeConnection) : [],
      updatedAt: payload.updatedAt || new Date().toISOString()
    };
  }

  return {
    loadConnections
  };
}
