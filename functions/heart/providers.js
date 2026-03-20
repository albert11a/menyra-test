"use strict";

const admin = require("firebase-admin");
const {
  asText,
  createIncidentId,
  createRunId,
  normalizeSeverity,
  normalizeStatus,
  serializeFirestoreValue,
  toIso
} = require("./common");

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

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function cloneRecord(value) {
  return value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : {};
}

function sortByNewest(items = [], key = "updatedAt") {
  return items.slice().sort((left, right) => String(right?.[key] || "").localeCompare(String(left?.[key] || "")));
}

function normalizeModuleStatus(item = {}) {
  return {
    module: asText(item.module || item.key || "unknown"),
    label: asText(item.label || item.module || item.key || "Unknown"),
    status: normalizeStatus(item.status, "idle"),
    note: asText(item.note || item.summary),
    latestFailure: asText(item.latestFailure || item.failureSummary),
    incidentCount: Math.max(0, Number(item.incidentCount) || 0),
    lastCheckAt: asText(item.lastCheckAt || item.updatedAt || item.completedAt)
  };
}

function normalizeRunRecord(record = {}) {
  const data = serializeFirestoreValue(record);
  return {
    id: asText(data.id),
    mode: asText(data.mode, "smoke"),
    source: asText(data.source, "heart"),
    environment: asText(data.environment, "production"),
    status: normalizeStatus(data.status, "idle"),
    summary: asText(data.summary || data.title || "No summary available."),
    triggerSource: asText(data.triggerSource || data.source || "heart"),
    startedBy: asText(data.startedBy || data.actorName || data.startedByEmail),
    startedByUid: asText(data.startedByUid),
    startedByEmail: asText(data.startedByEmail),
    startedAt: asText(data.startedAt || data.createdAt),
    endedAt: asText(data.endedAt),
    updatedAt: asText(data.updatedAt || data.startedAt || data.createdAt),
    durationMs: Math.max(0, Number(data.durationMs) || 0),
    branch: asText(data.branch || data.github?.headBranch),
    build: asText(data.build || data.github?.headSha || data.commitSha),
    passedChecks: Math.max(0, Number(data.passedChecks) || 0),
    failedChecks: Math.max(0, Number(data.failedChecks) || 0),
    warningCount: Math.max(0, Number(data.warningCount) || 0),
    currentStep: asText(data.currentStep),
    modules: ensureArray(data.modules).map(normalizeModuleStatus),
    timeline: ensureArray(data.timeline),
    createdEntities: ensureArray(data.createdEntities),
    cleanup: data.cleanup && typeof data.cleanup === "object" ? data.cleanup : { status: "idle", summary: "No cleanup information.", items: [] },
    artifacts: ensureArray(data.artifacts),
    failureDetails: ensureArray(data.failureDetails),
    github: data.github && typeof data.github === "object" ? data.github : {}
  };
}

function normalizeIncidentRecord(record = {}) {
  const data = serializeFirestoreValue(record);
  return {
    id: asText(data.id),
    runId: asText(data.runId),
    source: asText(data.source, "runtime"),
    module: asText(data.module || data.source || "unknown"),
    severity: normalizeSeverity(data.severity, "info"),
    title: asText(data.title || data.summary || "Incident"),
    message: asText(data.message || data.note),
    status: asText(data.status || "open"),
    createdAt: asText(data.createdAt),
    updatedAt: asText(data.updatedAt || data.createdAt),
    environment: asText(data.environment, "production"),
    build: asText(data.build),
    actor: asText(data.actor),
    device: asText(data.device || data.browser),
    artifactLinks: ensureArray(data.artifactLinks),
    meta: data.meta && typeof data.meta === "object" ? data.meta : {}
  };
}

function createHeartProviders({ db }) {
  const runsCollection = db.collection("heartRuns");
  const incidentsCollection = db.collection("heartIncidents");

  async function listDocsOrdered(collectionRef, key = "updatedAt", limitCount = 25) {
    try {
      const snap = await collectionRef.orderBy(key, "desc").limit(limitCount).get();
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...serializeFirestoreValue(docSnap.data() || {}) }));
    } catch {
      const snap = await collectionRef.limit(limitCount).get();
      return sortByNewest(
        snap.docs.map((docSnap) => ({ id: docSnap.id, ...serializeFirestoreValue(docSnap.data() || {}) })),
        key
      );
    }
  }

  async function listRuns(limitCount = 25) {
    const docs = await listDocsOrdered(runsCollection, "updatedAt", limitCount);
    return docs.map(normalizeRunRecord);
  }

  async function getRun(runId) {
    const safeRunId = asText(runId);
    if (!safeRunId) return null;
    const snap = await runsCollection.doc(safeRunId).get();
    if (!snap.exists) return null;
    return normalizeRunRecord({ id: snap.id, ...snap.data() });
  }

  async function createQueuedRun({
    mode = "smoke",
    environment = "production",
    startedBy = "",
    startedByUid = "",
    startedByEmail = "",
    triggerSource = "heart-ui",
    summary = ""
  } = {}) {
    const runId = createRunId(mode);
    const now = new Date().toISOString();
    const payload = {
      id: runId,
      mode,
      source: "heart",
      environment,
      status: "queued",
      summary: asText(summary, `${mode === "synthetic" ? "Synthetic" : "Smoke"} run queued.`),
      triggerSource,
      startedBy,
      startedByUid,
      startedByEmail,
      startedAt: now,
      updatedAt: now,
      endedAt: "",
      durationMs: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningCount: 0,
      currentStep: "Queued for secure runner dispatch.",
      modules: [],
      timeline: [{
        id: "queued",
        title: "Run queued",
        status: "queued",
        note: "Heart created the run and is waiting for the runner provider.",
        startedAt: now,
        endedAt: ""
      }],
      createdEntities: [],
      cleanup: {
        status: "idle",
        summary: "No cleanup activity recorded yet.",
        items: []
      },
      artifacts: [],
      failureDetails: [],
      github: {}
    };
    await runsCollection.doc(runId).set(payload, { merge: true });
    return normalizeRunRecord(payload);
  }

  async function mergeRun(runId, patch = {}) {
    const safeRunId = asText(runId);
    if (!safeRunId) throw new Error("runId required");
    const existing = await getRun(safeRunId);
    const next = {
      ...(existing || {}),
      ...cloneRecord(patch),
      id: safeRunId,
      updatedAt: new Date().toISOString()
    };
    await runsCollection.doc(safeRunId).set(next, { merge: true });
    return normalizeRunRecord(next);
  }

  async function appendTimelineEntry(runId, entry = {}) {
    const existing = await getRun(runId);
    const timeline = ensureArray(existing?.timeline);
    const nextEntry = {
      id: asText(entry.id, `timeline_${timeline.length + 1}`),
      title: asText(entry.title || entry.name || `Step ${timeline.length + 1}`),
      status: normalizeStatus(entry.status, "idle"),
      note: asText(entry.note || entry.message),
      startedAt: asText(entry.startedAt || new Date().toISOString()),
      endedAt: asText(entry.endedAt)
    };
    const nextTimeline = [...timeline, nextEntry];
    await runsCollection.doc(runId).set({
      timeline: nextTimeline,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return nextTimeline;
  }

  async function saveRunReport(runId, report = {}) {
    const safeRunId = asText(runId);
    if (!safeRunId) throw new Error("runId required");
    const existing = await getRun(safeRunId);
    const startedAt = asText(report.startedAt || existing?.startedAt || new Date().toISOString());
    const endedAt = asText(report.endedAt || new Date().toISOString());
    const durationMs = Math.max(0, Number(report.durationMs) || (new Date(endedAt).getTime() - new Date(startedAt).getTime()));
    const payload = {
      ...(existing || {}),
      id: safeRunId,
      mode: asText(report.mode || existing?.mode || "smoke"),
      source: asText(report.source || existing?.source || "heart"),
      environment: asText(report.environment || existing?.environment || "production"),
      status: normalizeStatus(report.status || existing?.status, "idle"),
      summary: asText(report.summary || existing?.summary || "No summary available."),
      triggerSource: asText(report.triggerSource || existing?.triggerSource || "heart"),
      startedBy: asText(report.startedBy || existing?.startedBy),
      startedByUid: asText(report.startedByUid || existing?.startedByUid),
      startedByEmail: asText(report.startedByEmail || existing?.startedByEmail),
      startedAt,
      endedAt,
      updatedAt: new Date().toISOString(),
      durationMs,
      branch: asText(report.branch || existing?.branch),
      build: asText(report.build || existing?.build),
      passedChecks: Math.max(0, Number(report.passedChecks) || 0),
      failedChecks: Math.max(0, Number(report.failedChecks) || 0),
      warningCount: Math.max(0, Number(report.warningCount) || 0),
      currentStep: asText(report.currentStep || existing?.currentStep),
      modules: ensureArray(report.modules).map(normalizeModuleStatus),
      timeline: ensureArray(report.timeline).map((item, index) => ({
        id: asText(item.id, `timeline_${index + 1}`),
        title: asText(item.title || item.name || `Step ${index + 1}`),
        status: normalizeStatus(item.status, "idle"),
        note: asText(item.note || item.message),
        startedAt: asText(item.startedAt),
        endedAt: asText(item.endedAt)
      })),
      createdEntities: ensureArray(report.createdEntities),
      cleanup: report.cleanup && typeof report.cleanup === "object"
        ? {
            status: normalizeStatus(report.cleanup.status, "idle"),
            summary: asText(report.cleanup.summary || "No cleanup information."),
            items: ensureArray(report.cleanup.items)
          }
        : { status: "idle", summary: "No cleanup information.", items: [] },
      artifacts: ensureArray(report.artifacts),
      failureDetails: ensureArray(report.failureDetails),
      github: report.github && typeof report.github === "object"
        ? { ...(existing?.github || {}), ...report.github }
        : (existing?.github || {})
    };
    await runsCollection.doc(safeRunId).set(payload, { merge: true });
    return normalizeRunRecord(payload);
  }

  async function listIncidents(limitCount = 50) {
    const docs = await listDocsOrdered(incidentsCollection, "updatedAt", limitCount);
    return docs.map(normalizeIncidentRecord);
  }

  async function createIncident(patch = {}) {
    const id = asText(patch.id, createIncidentId());
    const now = new Date().toISOString();
    const payload = {
      id,
      runId: asText(patch.runId),
      source: asText(patch.source, "runtime"),
      module: asText(patch.module || patch.source || "unknown"),
      severity: normalizeSeverity(patch.severity, "info"),
      title: asText(patch.title || "Incident"),
      message: asText(patch.message || patch.note),
      status: asText(patch.status || "open"),
      createdAt: asText(patch.createdAt || now),
      updatedAt: asText(patch.updatedAt || now),
      environment: asText(patch.environment, "production"),
      build: asText(patch.build),
      actor: asText(patch.actor),
      device: asText(patch.device || patch.browser),
      artifactLinks: ensureArray(patch.artifactLinks),
      meta: patch.meta && typeof patch.meta === "object" ? patch.meta : {}
    };
    await incidentsCollection.doc(id).set(payload, { merge: true });
    return normalizeIncidentRecord(payload);
  }

  function buildModuleHealth(runs = [], incidents = []) {
    const latestByModule = new Map();
    runs.forEach((run) => {
      ensureArray(run.modules).forEach((moduleStatus) => {
        const safe = normalizeModuleStatus(moduleStatus);
        const current = latestByModule.get(safe.module);
        if (!current || String(safe.lastCheckAt || run.updatedAt || "") > String(current.lastCheckAt || "")) {
          latestByModule.set(safe.module, {
            ...safe,
            lastCheckAt: safe.lastCheckAt || run.updatedAt || run.endedAt || run.startedAt
          });
        }
      });
    });
    const incidentsByModule = new Map();
    incidents.forEach((incident) => {
      const key = asText(incident.module || incident.source || "unknown");
      incidentsByModule.set(key, (incidentsByModule.get(key) || 0) + 1);
    });
    return MODULE_ORDER.map((moduleKey) => {
      const existing = latestByModule.get(moduleKey) || {};
      return normalizeModuleStatus({
        module: moduleKey,
        label: moduleKey.toUpperCase(),
        status: existing.status || (incidentsByModule.get(moduleKey) ? "warning" : "idle"),
        note: existing.note || (incidentsByModule.get(moduleKey) ? "Incidents recorded for this module." : "No checks recorded yet."),
        latestFailure: existing.latestFailure || "",
        incidentCount: incidentsByModule.get(moduleKey) || 0,
        lastCheckAt: existing.lastCheckAt || ""
      });
    });
  }

  function buildDashboardSummary({ runs = [], incidents = [], connections = [] } = {}) {
    const latestSmokeRun = runs.find((run) => run.mode === "smoke") || null;
    const latestSyntheticRun = runs.find((run) => run.mode === "synthetic") || null;
    const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
    const criticalIncidents = activeIncidents.filter((incident) => incident.severity === "critical");
    const overallStatus = criticalIncidents.length
      ? "critical"
      : activeIncidents.length
        ? "warning"
        : [latestSmokeRun, latestSyntheticRun].some((run) => run && ["failed", "critical"].includes(run.status))
          ? "warning"
          : "success";
    return {
      overallStatus,
      overallNote: criticalIncidents.length
        ? `${criticalIncidents.length} critical incident(s) need attention.`
        : activeIncidents.length
          ? `${activeIncidents.length} open incident(s) are being tracked.`
          : "System stable. No open incidents recorded.",
      updatedAt: new Date().toISOString(),
      latestSmokeRun,
      latestSyntheticRun,
      latestIncidents: incidents.slice(0, 8),
      recentRuns: runs.slice(0, 12),
      moduleHealth: buildModuleHealth(runs, incidents),
      liveMonitoringSummary: {
        activeIncidents: activeIncidents.length,
        criticalIncidents: criticalIncidents.length,
        latestFailure: asText(activeIncidents[0]?.title || latestSmokeRun?.summary || latestSyntheticRun?.summary)
      },
      connectionsPreview: connections.slice(0, 4),
      quickActions: [
        { id: "start-smoke", label: "Start Smoke", action: "start-smoke", note: "Critical-path health verification." },
        { id: "start-synthetic", label: "Start Full Synthetic", action: "start-synthetic", note: "Isolated synthetic system exercise." },
        { id: "refresh-heart", label: "Refresh", action: "refresh-heart", note: "Reload monitoring, incidents, runs and connections." }
      ]
    };
  }

  function buildConnections({ githubConfig = null, runs = [], incidents = [] } = {}) {
    const latestRun = runs[0] || null;
    const latestIncident = incidents[0] || null;
    return [
      {
        id: "github-actions",
        name: "GitHub Actions Runner",
        kind: "github",
        status: githubConfig?.configured ? "success" : "warning",
        note: githubConfig?.configured ? "Secure workflow dispatch is configured." : "Configure HEART_GITHUB_* env values to enable secure workflow dispatch.",
        lastCheckedAt: new Date().toISOString(),
        mode: githubConfig?.configured ? "real" : "not-configured",
        detail: githubConfig?.configured ? `${githubConfig.owner}/${githubConfig.repo}` : "No secure runner provider configured yet."
      },
      {
        id: "firebase-heart-store",
        name: "Firebase Heart Store",
        kind: "firebase",
        status: "success",
        note: "Firestore-backed run history and incidents are available.",
        lastCheckedAt: new Date().toISOString(),
        mode: "real",
        detail: latestRun ? `Latest run ${latestRun.id}` : "No runs recorded yet."
      },
      {
        id: "runtime-monitoring",
        name: "Runtime Monitoring Feed",
        kind: "runtime",
        status: latestIncident && latestIncident.severity === "critical" ? "critical" : latestIncident ? "warning" : "success",
        note: latestIncident ? latestIncident.title : "No incidents recorded.",
        lastCheckedAt: latestIncident?.updatedAt || new Date().toISOString(),
        mode: "real",
        detail: latestIncident ? `${latestIncident.source}/${latestIncident.module}` : "Waiting for incidents or monitoring ingest."
      },
      {
        id: "sentry-adapter",
        name: "Sentry Adapter",
        kind: "sentry",
        status: "idle",
        note: "Architecture reserved. No Sentry credentials configured.",
        lastCheckedAt: "",
        mode: "placeholder",
        detail: "Safe placeholder connection only. No client secret exposure."
      }
    ];
  }

  return {
    listRuns,
    getRun,
    createQueuedRun,
    mergeRun,
    appendTimelineEntry,
    saveRunReport,
    listIncidents,
    createIncident,
    buildModuleHealth,
    buildDashboardSummary,
    buildConnections
  };
}

module.exports = {
  createHeartProviders
};
