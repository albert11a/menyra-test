import {
  normalizeRunDetail,
  normalizeRunSummary
} from "./heart-test-report-normalizer.js";

export function createHeartTestRunnerAdapter({ apiClient }) {
  async function loadRuns() {
    const payload = await apiClient.request("heartGetRuns");
    return {
      items: Array.isArray(payload.items) ? payload.items.map(normalizeRunSummary) : [],
      updatedAt: payload.updatedAt || new Date().toISOString()
    };
  }

  async function loadRunDetail(runId) {
    const payload = await apiClient.request("heartGetRunDetail", {
      method: "POST",
      body: { runId }
    });
    return normalizeRunDetail(payload.detail || {});
  }

  async function startSmokeRun() {
    const payload = await apiClient.request("heartStartSmokeRun", {
      method: "POST",
      body: {}
    });
    return payload;
  }

  async function startSyntheticRun() {
    const payload = await apiClient.request("heartStartSyntheticRun", {
      method: "POST",
      body: {}
    });
    return payload;
  }

  async function cancelRun(runId) {
    const payload = await apiClient.request("heartCancelRun", {
      method: "POST",
      body: { runId }
    });
    return payload;
  }

  return {
    loadRuns,
    loadRunDetail,
    startSmokeRun,
    startSyntheticRun,
    cancelRun
  };
}
