"use strict";

// Generated from ../../shared/github-execution-state.js. Do not edit manually.
function asText(value = "", fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeGithubExecutionState(status = "", conclusion = "", fallback = "idle") {
  const safeConclusion = asText(conclusion).toLowerCase();
  if (safeConclusion) {
    if (safeConclusion === "success") return "success";
    if (safeConclusion === "failure") return "failed";
    if (safeConclusion === "timed_out") return "failed";
    if (safeConclusion === "startup_failure") return "critical";
    if (safeConclusion === "cancelled") return "cancelled";
    if (safeConclusion === "action_required") return "warning";
    if (safeConclusion === "neutral") return "warning";
    if (safeConclusion === "skipped") return "warning";
    if (safeConclusion === "stale") return "warning";
    return safeConclusion;
  }

  const safeStatus = asText(status).toLowerCase();
  if (!safeStatus) return fallback;
  if (safeStatus === "queued" || safeStatus === "requested" || safeStatus === "waiting" || safeStatus === "pending") return "queued";
  if (safeStatus === "in_progress" || safeStatus === "running") return "running";
  if (safeStatus === "completed") return fallback;
  return safeStatus;
}

module.exports = {
  normalizeGithubExecutionState
};
