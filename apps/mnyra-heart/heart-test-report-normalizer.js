import {
  formatDateTime,
  getModuleLabel,
  getPackLabel,
  normalizeList
} from "./heart-ui-utils.js";
import {
  normalizeGithubExecutionState
} from "/shared/github-execution-state.js";

const MODULE_ORDER = Object.freeze([
  "auth",
  "feed",
  "profile",
  "business",
  "menu",
  "cart",
  "orders",
  "chat",
  "crm",
  "pwa"
]);

function asText(value = "", fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toIso(value = "") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function normalizeStatus(value = "", fallback = "idle") {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return fallback;
  if (status === "in_progress") return "running";
  if (status === "failure") return "failed";
  if (status === "timed_out") return "failed";
  if (status === "action_required") return "warning";
  if (status === "not-configured") return "not_configured";
  if (status === "needs-setup") return "not_configured";
  return status;
}

function normalizeSeverity(value = "", fallback = "info") {
  const severity = String(value || "").trim().toLowerCase();
  if (!severity) return fallback;
  if (severity === "error") return "critical";
  return severity;
}

function normalizeModuleStatus(item = {}) {
  return {
    module: asText(item.module || item.key || "unknown"),
    status: normalizeStatus(item.status, "idle"),
    note: asText(item.note || item.summary),
    latestFailure: asText(item.latestFailure || item.failureSummary),
    incidentCount: Math.max(0, Number(item.incidentCount) || 0),
    lastCheckAt: toIso(item.lastCheckAt || item.updatedAt || item.completedAt),
    label: getModuleLabel(item.module || item.key, asText(item.label || item.module || item.key || "Bereich")),
    personas: normalizeList(item.personas),
    checks: normalizeList(item.checks).map((check, index) => ({
      id: asText(check.id || `check-${index + 1}`),
      action: asText(check.action || check.title || `Check ${index + 1}`),
      status: normalizeStatus(check.status, "idle"),
      note: asText(check.note || check.message),
      area: asText(check.area || item.module || "unknown"),
      persona: asText(check.persona),
      startedAt: toIso(check.startedAt),
      endedAt: toIso(check.endedAt)
    })),
    counts: item.counts && typeof item.counts === "object" ? item.counts : {}
  };
}

function buildModuleHealthFromRuns(runs = [], incidents = []) {
  const latestByModule = new Map();
  normalizeList(runs).forEach((run) => {
    normalizeList(run.modules).forEach((moduleStatus) => {
      const current = latestByModule.get(moduleStatus.module);
      if (!current || String(moduleStatus.lastCheckAt || "") > String(current.lastCheckAt || "")) {
        latestByModule.set(moduleStatus.module, moduleStatus);
      }
    });
  });

  const incidentsByModule = new Map();
  normalizeList(incidents).forEach((incident) => {
    const key = asText(incident.module || incident.source || "unknown");
    incidentsByModule.set(key, (incidentsByModule.get(key) || 0) + 1);
  });

  return MODULE_ORDER.map((moduleKey) => {
    const existing = latestByModule.get(moduleKey) || {};
    return normalizeModuleStatus({
      module: moduleKey,
        label: moduleKey.toUpperCase(),
        status: existing.status || "idle",
      note: existing.note || "Noch keine Pruefung vorhanden.",
      latestFailure: existing.latestFailure || "",
      lastCheckAt: existing.lastCheckAt || "",
      incidentCount: incidentsByModule.get(moduleKey) || 0
    });
  });
}

export function normalizeRunSummary(item = {}) {
  const startedAt = toIso(item.startedAt || item.runStartedAt || item.createdAt);
  const endedAt = toIso(item.endedAt || item.updatedAt || item.completedAt);
  return {
    id: asText(item.id || item.runId || item.githubRunId),
    mode: asText(item.mode, "smoke"),
    packKey: asText(item.packKey || item.mode, "smoke"),
    packLabel: getPackLabel(item.packKey || item.mode, asText(item.packLabel || item.title || item.name || "Testlauf"), item.mode),
    packLevel: asText(item.packLevel),
    packSummary: asText(item.packSummary || item.summary),
    personas: normalizeList(item.personas),
    source: asText(item.source, "heart"),
    environment: asText(item.environment, "production"),
    status: normalizeGithubExecutionState(item.status || item.runStatus, item.conclusion, normalizeStatus(item.status || item.runStatus, "idle")),
    summary: asText(item.summary || item.title || item.name || "Noch keine Zusammenfassung vorhanden."),
    triggerSource: asText(item.triggerSource || item.event || item.actor),
    startedBy: asText(item.startedBy || item.actor || item.triggeredBy),
    startedAt,
    endedAt,
    durationMs: Math.max(0, Number(item.durationMs) || (startedAt && endedAt ? new Date(endedAt).getTime() - new Date(startedAt).getTime() : 0)),
    branch: asText(item.branch || item.headBranch),
    build: asText(item.build || item.commitShort || item.commitSha),
    passedChecks: Math.max(0, Number(item.passedChecks) || 0),
    failedChecks: Math.max(0, Number(item.failedChecks) || 0),
    warningCount: Math.max(0, Number(item.warningCount) || 0),
    statusBreakdown: item.statusBreakdown && typeof item.statusBreakdown === "object" ? item.statusBreakdown : {},
    currentStep: asText(item.currentStep),
    archived: item.archived === true,
    archivedAt: toIso(item.archivedAt),
    runFlags: item.runFlags && typeof item.runFlags === "object" ? item.runFlags : {},
    modules: normalizeList(item.modules).map(normalizeModuleStatus),
    artifacts: normalizeList(item.artifacts).map((artifact) => ({
      label: asText(artifact.label || artifact.name || "Datei"),
      kind: asText(artifact.kind || artifact.type || "artifact"),
      url: asText(artifact.url || artifact.downloadUrl),
      sizeLabel: asText(artifact.sizeLabel)
    }))
  };
}

export function normalizeRunDetail(detail = {}) {
  const run = normalizeRunSummary(detail);
  return {
    ...run,
    timeline: normalizeList(detail.timeline || detail.steps || detail.actionLog).map((step, index) => ({
      id: asText(step.id || `step-${index + 1}`),
      title: asText(step.title || step.name || `Schritt ${index + 1}`),
      status: normalizeGithubExecutionState(step.status, step.conclusion, normalizeStatus(step.status, "idle")),
      note: asText(step.note || step.message || step.summary),
      startedAt: toIso(step.startedAt || step.started_at),
      endedAt: toIso(step.endedAt || step.completedAt || step.completed_at)
    })),
    createdEntities: normalizeList(detail.createdEntities).map((entity, index) => ({
      id: asText(entity.id || `entity-${index + 1}`),
      type: asText(entity.type || "entity"),
      label: asText(entity.label || entity.name || entity.id || `Element ${index + 1}`),
      status: normalizeStatus(entity.status, "success"),
      summary: asText(entity.summary || entity.note),
      cleanupStatus: normalizeStatus(entity.cleanupStatus, "idle")
    })),
    cleanup: {
      status: normalizeStatus(detail.cleanup?.status, "idle"),
      summary: asText(detail.cleanup?.summary || "Keine Aufraeuminformation vorhanden."),
      items: normalizeList(detail.cleanup?.items).map((item, index) => ({
        id: asText(item.id || `cleanup-${index + 1}`),
        label: asText(item.label || item.name || `Aufraeumen ${index + 1}`),
        status: normalizeStatus(item.status, "idle"),
        note: asText(item.note)
      }))
    },
    failureDetails: normalizeList(detail.failureDetails).map((item, index) => ({
      id: asText(item.id || `failure-${index + 1}`),
      module: asText(item.module || item.source || "unknown"),
      area: asText(item.area || item.module || item.source || "unknown"),
      action: asText(item.action),
      persona: asText(item.persona),
      title: asText(item.title || item.message || `Problem ${index + 1}`),
      message: asText(item.message || item.note),
      severity: normalizeSeverity(item.severity, "warning")
    })),
    reportMeta: {
      reportGeneratedAt: toIso(detail.reportGeneratedAt || detail.updatedAt || run.endedAt || run.startedAt),
      reportLabel: asText(detail.reportLabel || `${run.packLabel || run.mode.toUpperCase()} Bericht`),
      formattedStartedAt: formatDateTime(run.startedAt),
      formattedEndedAt: formatDateTime(run.endedAt)
    }
  };
}

export function normalizeIncident(item = {}) {
  return {
    id: asText(item.id),
    runId: asText(item.runId),
    source: asText(item.source || item.provider || "runtime"),
    module: asText(item.module || item.source || "unknown"),
    severity: normalizeSeverity(item.severity),
    title: asText(item.title || item.summary || "Meldung"),
    message: asText(item.message || item.note),
    status: asText(item.status || "open"),
    createdAt: toIso(item.createdAt || item.created_at),
    updatedAt: toIso(item.updatedAt || item.updated_at),
    environment: asText(item.environment, "production"),
    build: asText(item.build || item.commitShort || item.commitSha),
    actor: asText(item.actor || item.startedBy),
    device: asText(item.device || item.browser),
    artifactLinks: normalizeList(item.artifactLinks).map((link, index) => ({
      id: asText(link.id || `artifact-${index + 1}`),
      label: asText(link.label || link.name || `Artifact ${index + 1}`),
      url: asText(link.url)
    })),
    meta: item.meta && typeof item.meta === "object" ? item.meta : {}
  };
}

export function normalizeConnection(item = {}) {
  return {
    id: asText(item.id || item.key || item.source),
    name: asText(item.name || item.label || item.source || "Verbindung"),
    kind: asText(item.kind || item.source || "internal"),
    status: normalizeStatus(item.status, "idle"),
    note: asText(item.note || item.summary),
    lastCheckedAt: toIso(item.lastCheckedAt || item.updatedAt),
    mode: asText(item.mode || item.integrationMode),
    detail: asText(item.detail)
  };
}

export function normalizeDashboardData(payload = {}) {
  const latestSmokeRun = payload.latestSmokeRun ? normalizeRunSummary(payload.latestSmokeRun) : null;
  const latestSyntheticRun = payload.latestSyntheticRun ? normalizeRunSummary(payload.latestSyntheticRun) : null;
  const latestPersonaRun = payload.latestPersonaRun ? normalizeRunSummary(payload.latestPersonaRun) : null;
  const incidents = normalizeList(payload.latestIncidents).map(normalizeIncident);
  const runs = normalizeList(payload.recentRuns).map(normalizeRunSummary);
  const moduleHealth = normalizeList(payload.moduleHealth).length
    ? payload.moduleHealth.map(normalizeModuleStatus)
    : buildModuleHealthFromRuns([latestSmokeRun, latestSyntheticRun, latestPersonaRun, ...runs].filter(Boolean), incidents);
  return {
    overallStatus: normalizeStatus(payload.overallStatus, "idle"),
    overallNote: asText(payload.overallNote || "Noch keine Statusnotiz vorhanden."),
    updatedAt: toIso(payload.updatedAt || new Date().toISOString()),
    liveMonitoringSummary: {
      activeIncidents: Math.max(0, Number(payload.liveMonitoringSummary?.activeIncidents) || incidents.filter((incident) => incident.status !== "resolved").length),
      criticalIncidents: Math.max(0, Number(payload.liveMonitoringSummary?.criticalIncidents) || incidents.filter((incident) => incident.severity === "critical").length),
      latestFailure: asText(payload.liveMonitoringSummary?.latestFailure || incidents[0]?.title)
    },
    smokeStatus: latestSmokeRun,
    syntheticStatus: latestSyntheticRun,
    personaStatus: latestPersonaRun,
    moduleHealth,
    latestIncidents: incidents,
    recentRuns: runs,
    connectionsPreview: normalizeList(payload.connectionsPreview).map(normalizeConnection),
    quickActions: normalizeList(payload.quickActions).map((action, index) => ({
      id: asText(action.id || `action-${index + 1}`),
      label: asText(action.label || action.title),
      action: asText(action.action || action.id),
      note: asText(action.note),
      packKey: asText(action.packKey || action.id),
      mode: asText(action.mode),
      workflowMode: asText(action.workflowMode)
    }))
  };
}

export function normalizeSetupData(item = {}) {
  const personas = item.personas && typeof item.personas === "object" ? item.personas : {};
  return {
    id: asText(item.id || "default"),
    restaurantId: asText(item.restaurantId),
    restaurantName: asText(item.restaurantName),
    restaurantHandle: asText(item.restaurantHandle),
    restaurantQuery: asText(item.restaurantQuery || item.restaurantName || item.restaurantId),
    guestRouteUrl: asText(item.guestRouteUrl),
    allowLiveMutations: item.allowLiveMutations === true,
    syntheticIsolationKeyReady: !!asText(item.syntheticIsolationKey),
    packConfig: item.packConfig && typeof item.packConfig === "object" ? item.packConfig : {},
    updatedAt: toIso(item.updatedAt || item.createdAt),
    personas: Object.fromEntries(
      Object.entries(personas).map(([key, value]) => [key, {
        key,
        email: asText(value?.email),
        password: asText(value?.password),
        uid: asText(value?.uid),
        handle: asText(value?.handle),
        displayName: asText(value?.displayName),
        role: asText(value?.role || key),
        managed: value?.managed === true,
        ready: value?.ready !== false && !!asText(value?.email) && !!asText(value?.password),
        updatedAt: toIso(value?.updatedAt || item.updatedAt)
      }])
    )
  };
}
