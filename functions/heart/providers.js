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
const {
  getHeartPack,
  listHeartPackQuickActions
} = require("./generated/heart-pack-catalog.cjs");

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
const HEART_SETUP_DOC_ID = "default";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasOwn(value, key) {
  return !!value && Object.prototype.hasOwnProperty.call(value, key);
}

function cloneRecord(value) {
  return value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : {};
}

function formatSizeLabel(sizeBytes = 0) {
  const size = Math.max(0, Number(sizeBytes) || 0);
  if (!size) return "";
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
  }
  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${size} B`;
}

function mergeDeep(base = {}, patch = {}) {
  const next = { ...ensureObject(base) };
  Object.entries(ensureObject(patch)).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      next[key] = value.slice();
      return;
    }
    if (value && typeof value === "object") {
      next[key] = mergeDeep(next[key], value);
      return;
    }
    if (value !== undefined) {
      next[key] = value;
    }
  });
  return next;
}

function sortByNewest(items = [], key = "updatedAt") {
  return items.slice().sort((left, right) => String(right?.[key] || "").localeCompare(String(left?.[key] || "")));
}

function isGithubRateLimited(run = {}) {
  const until = Date.parse(asText(run?.github?.rateLimitedUntil));
  return Number.isFinite(until) && until > Date.now();
}

function normalizeModuleStatus(item = {}) {
  const checks = ensureArray(item.checks).map((check, index) => ({
    id: asText(check.id, `check_${index + 1}`),
    action: asText(check.action || check.title || `Check ${index + 1}`),
    status: normalizeStatus(check.status, "idle"),
    note: asText(check.note || check.message),
    area: asText(check.area || item.module || item.key || "unknown"),
    persona: asText(check.persona),
    startedAt: asText(check.startedAt),
    endedAt: asText(check.endedAt)
  }));
  return {
    module: asText(item.module || item.key || "unknown"),
    label: asText(item.label || item.module || item.key || "Unknown"),
    status: normalizeStatus(item.status, "idle"),
    note: asText(item.note || item.summary),
    latestFailure: asText(item.latestFailure || item.failureSummary),
    incidentCount: Math.max(0, Number(item.incidentCount) || 0),
    lastCheckAt: asText(item.lastCheckAt || item.updatedAt || item.completedAt),
    personas: ensureArray(item.personas),
    checks,
    counts: item.counts && typeof item.counts === "object" ? item.counts : {}
  };
}

function normalizeArtifactRecord(item = {}, index = 0) {
  const data = ensureObject(serializeFirestoreValue(item));
  const kind = asText(data.kind || data.type, "artifact");
  const sizeBytes = Math.max(0, Number(data.sizeBytes) || 0);
  const url = asText(data.url || data.downloadUrl);
  const previewUrl = asText(data.previewUrl || (kind === "screenshot" ? url : ""));
  const storagePath = asText(data.storagePath);
  const githubArtifactId = asText(data.githubArtifactId || data.githubId);
  return {
    id: asText(data.id, `artifact_${index + 1}`),
    label: asText(data.label || data.name, `Datei ${index + 1}`),
    kind,
    url,
    previewUrl,
    sizeBytes,
    sizeLabel: asText(data.sizeLabel, formatSizeLabel(sizeBytes)),
    source: asText(data.source, storagePath ? "storage" : githubArtifactId ? "github" : "external"),
    storagePath,
    bucket: asText(data.bucket),
    fileName: asText(data.fileName),
    contentType: asText(data.contentType),
    uploadedAt: asText(data.uploadedAt || data.createdAt),
    githubArtifactId,
    deletable: data.deletable !== false && !!(storagePath || githubArtifactId)
  };
}

function normalizeIncidentArtifact(item = {}, index = 0) {
  const artifact = normalizeArtifactRecord(item, index);
  return {
    id: artifact.id,
    label: artifact.label,
    kind: artifact.kind,
    url: artifact.url,
    previewUrl: artifact.previewUrl,
    sizeLabel: artifact.sizeLabel,
    storagePath: artifact.storagePath,
    githubArtifactId: artifact.githubArtifactId,
    deletable: artifact.deletable
  };
}

function normalizeRunRecord(record = {}) {
  const data = serializeFirestoreValue(record);
  const pack = getHeartPack(data.packKey || data.mode);
  return {
    id: asText(data.id),
    mode: asText(data.mode, pack.mode || "smoke"),
    packKey: asText(data.packKey, pack.key),
    packLabel: asText(data.packLabel, pack.title),
    packLevel: asText(data.packLevel, pack.level),
    packSummary: asText(data.packSummary, pack.summary),
    personas: ensureArray(data.personas || pack.personas),
    source: asText(data.source, "heart"),
    environment: asText(data.environment, "production"),
    status: normalizeStatus(data.status, "idle"),
    summary: asText(data.summary || data.title || "Keine Zusammenfassung vorhanden."),
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
    statusBreakdown: data.statusBreakdown && typeof data.statusBreakdown === "object" ? data.statusBreakdown : {},
    currentStep: asText(data.currentStep),
    archived: data.archived === true,
    archivedAt: asText(data.archivedAt),
    modules: ensureArray(data.modules).map(normalizeModuleStatus),
    timeline: ensureArray(data.timeline),
    createdEntities: ensureArray(data.createdEntities),
    cleanup: data.cleanup && typeof data.cleanup === "object" ? data.cleanup : { status: "idle", summary: "Keine Aufraeuminformation vorhanden.", items: [] },
    artifacts: ensureArray(data.artifacts).map(normalizeArtifactRecord),
    failureDetails: ensureArray(data.failureDetails),
    github: data.github && typeof data.github === "object" ? data.github : {},
    runFlags: data.runFlags && typeof data.runFlags === "object" ? data.runFlags : {}
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
    artifactLinks: ensureArray(data.artifactLinks).map(normalizeIncidentArtifact),
    meta: data.meta && typeof data.meta === "object" ? data.meta : {}
  };
}

function normalizeSetupPersona(key = "", value = {}) {
  const data = ensureObject(serializeFirestoreValue(value));
  return {
    key: asText(key),
    email: asText(data.email),
    password: asText(data.password),
    uid: asText(data.uid),
    handle: asText(data.handle),
    displayName: asText(data.displayName || data.name),
    role: asText(data.role || key),
    managed: data.managed === true,
    ready: data.ready !== false && !!asText(data.email) && !!asText(data.password),
    updatedAt: asText(data.updatedAt)
  };
}

function normalizeSetupRecord(record = {}) {
  const data = ensureObject(serializeFirestoreValue(record));
  const personas = ensureObject(data.personas);
  return {
    id: asText(data.id, HEART_SETUP_DOC_ID),
    restaurantId: asText(data.restaurantId),
    restaurantName: asText(data.restaurantName),
    restaurantHandle: asText(data.restaurantHandle),
    restaurantQuery: asText(data.restaurantQuery || data.restaurantName || data.restaurantId),
    guestRouteUrl: asText(data.guestRouteUrl),
    allowLiveMutations: data.allowLiveMutations !== false,
    syntheticIsolationKey: asText(data.syntheticIsolationKey),
    packConfig: ensureObject(data.packConfig),
    managed: ensureObject(data.managed),
    personas: Object.fromEntries(
      Object.entries(personas).map(([key, value]) => [key, normalizeSetupPersona(key, value)])
    ),
    createdAt: asText(data.createdAt),
    updatedAt: asText(data.updatedAt)
  };
}

function createHeartProviders({ db }) {
  const runsCollection = db.collection("heartRuns");
  const incidentsCollection = db.collection("heartIncidents");
  const setupDocRef = db.collection("heartSetup").doc(HEART_SETUP_DOC_ID);

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

  async function getSetup() {
    const snap = await setupDocRef.get();
    if (!snap.exists) {
      return normalizeSetupRecord({
        id: HEART_SETUP_DOC_ID,
        personas: {},
        packConfig: {},
        managed: {}
      });
    }
    return normalizeSetupRecord({ id: snap.id, ...snap.data() });
  }

  async function getIncident(incidentId) {
    const safeIncidentId = asText(incidentId);
    if (!safeIncidentId) return null;
    const snap = await incidentsCollection.doc(safeIncidentId).get();
    if (!snap.exists) return null;
    return normalizeIncidentRecord({ id: snap.id, ...snap.data() });
  }

  async function saveSetup(patch = {}) {
    const existing = await getSetup();
    const now = new Date().toISOString();
    const next = mergeDeep(existing, patch);
    next.id = HEART_SETUP_DOC_ID;
    next.updatedAt = now;
    if (!existing.createdAt) {
      next.createdAt = now;
    }
    await setupDocRef.set(next, { merge: true });
    return normalizeSetupRecord(next);
  }

  async function createQueuedRun({
    mode = "smoke",
    packKey = "",
    packLabel = "",
    packLevel = "",
    packSummary = "",
    personas = [],
    environment = "production",
    startedBy = "",
    startedByUid = "",
    startedByEmail = "",
    triggerSource = "heart-ui",
    summary = ""
  } = {}) {
    const runId = createRunId(packKey || mode);
    const now = new Date().toISOString();
    const payload = {
      id: runId,
      mode,
      source: "heart",
      environment,
      status: "queued",
      summary: asText(summary, `${mode === "synthetic" ? "Komplett" : "Schnell"}test wurde in die Warteschlange gestellt.`),
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
      currentStep: "Wartet auf sicheren Runner-Start.",
      modules: [],
      timeline: [{
        id: "queued",
        title: "Lauf wartet",
        status: "queued",
        note: "Heart hat den Lauf angelegt und wartet auf den Runner.",
        startedAt: now,
        endedAt: ""
      }],
      createdEntities: [],
      cleanup: {
        status: "idle",
        summary: "Noch kein Aufraeumen protokolliert.",
        items: []
      },
      artifacts: [],
      failureDetails: [],
      github: {},
      packKey: asText(packKey, getHeartPack(mode).key),
      packLabel: asText(packLabel, getHeartPack(mode).title),
      packLevel: asText(packLevel, getHeartPack(mode).level),
      packSummary: asText(packSummary, getHeartPack(mode).summary),
      personas: ensureArray(personas).length ? ensureArray(personas) : getHeartPack(mode).personas,
      archived: false,
      archivedAt: "",
      statusBreakdown: {
        success: 0,
        warning: 0,
        failed: 0,
        critical: 0,
        skipped: 0,
        not_configured: 0,
        guarded: 0
      }
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

  async function appendRunArtifacts(runId, artifacts = []) {
    const safeRunId = asText(runId);
    if (!safeRunId) throw new Error("runId required");
    const existing = await getRun(safeRunId);
    if (!existing) throw new Error("Run not found");
    const currentArtifacts = ensureArray(existing.artifacts).map(normalizeArtifactRecord);
    const nextArtifacts = [...currentArtifacts];
    ensureArray(artifacts).forEach((artifact, index) => {
      const normalized = normalizeArtifactRecord(artifact, currentArtifacts.length + index);
      const duplicateIndex = nextArtifacts.findIndex((item) => item.id === normalized.id);
      if (duplicateIndex >= 0) {
        nextArtifacts[duplicateIndex] = normalized;
      } else {
        nextArtifacts.push(normalized);
      }
    });
    const next = {
      ...(existing || {}),
      artifacts: nextArtifacts,
      updatedAt: new Date().toISOString()
    };
    await runsCollection.doc(safeRunId).set({
      artifacts: nextArtifacts,
      updatedAt: next.updatedAt
    }, { merge: true });
    return normalizeRunRecord(next);
  }

  async function removeRunArtifact(runId, artifactId) {
    const safeRunId = asText(runId);
    const safeArtifactId = asText(artifactId);
    if (!safeRunId || !safeArtifactId) throw new Error("runId and artifactId required");
    const existing = await getRun(safeRunId);
    if (!existing) throw new Error("Run not found");
    const currentArtifacts = ensureArray(existing.artifacts).map(normalizeArtifactRecord);
    const removedArtifact = currentArtifacts.find((artifact) => artifact.id === safeArtifactId);
    if (!removedArtifact) throw new Error("Artifact not found");
    const nextArtifacts = currentArtifacts.filter((artifact) => artifact.id !== safeArtifactId);
    const next = {
      ...(existing || {}),
      artifacts: nextArtifacts,
      updatedAt: new Date().toISOString()
    };
    await runsCollection.doc(safeRunId).set({
      artifacts: nextArtifacts,
      updatedAt: next.updatedAt
    }, { merge: true });
    return {
      run: normalizeRunRecord(next),
      artifact: removedArtifact
    };
  }

  async function updateRunArchive(runIds = [], archived = false) {
    const safeIds = ensureArray(runIds).map((runId) => asText(runId)).filter(Boolean);
    if (!safeIds.length) return [];
    const now = new Date().toISOString();
    const items = [];
    for (const runId of safeIds) {
      const next = await mergeRun(runId, {
        archived: !!archived,
        archivedAt: archived ? now : ""
      });
      items.push(next);
    }
    return items;
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
    const durationMs = hasOwn(report, "durationMs")
      ? Math.max(0, Number(report.durationMs) || 0)
      : Math.max(0, Number(existing?.durationMs) || (new Date(endedAt).getTime() - new Date(startedAt).getTime()));
    const nextStatusBreakdown = hasOwn(report, "statusBreakdown") && report.statusBreakdown && typeof report.statusBreakdown === "object"
      ? report.statusBreakdown
      : (existing?.statusBreakdown || {});
    const nextModules = hasOwn(report, "modules")
      ? ensureArray(report.modules).map(normalizeModuleStatus)
      : ensureArray(existing?.modules).map(normalizeModuleStatus);
    const nextTimeline = hasOwn(report, "timeline")
      ? ensureArray(report.timeline).map((item, index) => ({
          id: asText(item.id, `timeline_${index + 1}`),
          title: asText(item.title || item.name || `Step ${index + 1}`),
          status: normalizeStatus(item.status, "idle"),
          note: asText(item.note || item.message),
          startedAt: asText(item.startedAt),
          endedAt: asText(item.endedAt)
        }))
      : ensureArray(existing?.timeline);
    const nextCreatedEntities = hasOwn(report, "createdEntities")
      ? ensureArray(report.createdEntities)
      : ensureArray(existing?.createdEntities);
    const nextCleanup = hasOwn(report, "cleanup") && report.cleanup && typeof report.cleanup === "object"
      ? {
          status: normalizeStatus(report.cleanup.status, "idle"),
          summary: asText(report.cleanup.summary || "Keine Aufraeuminformation vorhanden."),
          items: ensureArray(report.cleanup.items)
        }
      : (existing?.cleanup || { status: "idle", summary: "Keine Aufraeuminformation vorhanden.", items: [] });
    const nextArtifacts = hasOwn(report, "artifacts")
      ? ensureArray(report.artifacts).map(normalizeArtifactRecord)
      : ensureArray(existing?.artifacts).map(normalizeArtifactRecord);
    const nextFailureDetails = hasOwn(report, "failureDetails")
      ? ensureArray(report.failureDetails)
      : ensureArray(existing?.failureDetails);
    const payload = {
      ...(existing || {}),
      id: safeRunId,
      mode: asText(report.mode || existing?.mode || "smoke"),
      source: asText(report.source || existing?.source || "heart"),
      environment: asText(report.environment || existing?.environment || "production"),
      status: normalizeStatus(report.status || existing?.status, "idle"),
      summary: asText(report.summary || existing?.summary || "Keine Zusammenfassung vorhanden."),
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
      passedChecks: hasOwn(report, "passedChecks")
        ? Math.max(0, Number(report.passedChecks) || 0)
        : Math.max(0, Number(existing?.passedChecks) || 0),
      failedChecks: hasOwn(report, "failedChecks")
        ? Math.max(0, Number(report.failedChecks) || 0)
        : Math.max(0, Number(existing?.failedChecks) || 0),
      warningCount: hasOwn(report, "warningCount")
        ? Math.max(0, Number(report.warningCount) || 0)
        : Math.max(0, Number(existing?.warningCount) || 0),
      statusBreakdown: nextStatusBreakdown,
      currentStep: asText(report.currentStep || existing?.currentStep),
      modules: nextModules,
      timeline: nextTimeline,
      createdEntities: nextCreatedEntities,
      cleanup: nextCleanup,
      artifacts: nextArtifacts,
      failureDetails: nextFailureDetails,
      runFlags: report.runFlags && typeof report.runFlags === "object"
        ? report.runFlags
        : (existing?.runFlags || {}),
      github: report.github && typeof report.github === "object"
        ? { ...(existing?.github || {}), ...report.github }
        : (existing?.github || {}),
      archived: existing?.archived === true,
      archivedAt: asText(existing?.archivedAt)
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
      artifactLinks: ensureArray(patch.artifactLinks).map(normalizeIncidentArtifact),
      meta: patch.meta && typeof patch.meta === "object" ? patch.meta : {}
    };
    await incidentsCollection.doc(id).set(payload, { merge: true });
    return normalizeIncidentRecord(payload);
  }

  async function removeArtifactLinksFromIncidents(runId, artifact = {}) {
    const safeRunId = asText(runId);
    if (!safeRunId) return [];
    const artifactId = asText(artifact.id);
    const artifactUrl = asText(artifact.url);
    const artifactStoragePath = asText(artifact.storagePath);
    const artifactGithubId = asText(artifact.githubArtifactId);
    const snap = await incidentsCollection.where("runId", "==", safeRunId).get().catch(() => null);
    if (!snap || snap.empty) return [];
    const updates = [];
    const nextItems = [];
    snap.forEach((docSnap) => {
      const incident = normalizeIncidentRecord({ id: docSnap.id, ...docSnap.data() });
      const nextArtifactLinks = ensureArray(incident.artifactLinks).filter((link) => {
        return !(
          (artifactId && asText(link.id) === artifactId)
          || (artifactUrl && asText(link.url) === artifactUrl)
          || (artifactStoragePath && asText(link.storagePath) === artifactStoragePath)
          || (artifactGithubId && asText(link.githubArtifactId) === artifactGithubId)
        );
      });
      if (nextArtifactLinks.length === incident.artifactLinks.length) return;
      const updatedAt = new Date().toISOString();
      updates.push(docSnap.ref.set({
        artifactLinks: nextArtifactLinks,
        updatedAt
      }, { merge: true }));
      nextItems.push(normalizeIncidentRecord({
        ...incident,
        artifactLinks: nextArtifactLinks,
        updatedAt
      }));
    });
    if (updates.length) {
      await Promise.allSettled(updates);
    }
    return nextItems;
  }

  async function deleteIncident(incidentId) {
    const safeIncidentId = asText(incidentId);
    if (!safeIncidentId) throw new Error("incidentId required");
    const incident = await getIncident(safeIncidentId);
    if (!incident) throw new Error("Incident not found");
    await incidentsCollection.doc(safeIncidentId).delete();
    return incident;
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
        note: existing.note || (incidentsByModule.get(moduleKey) ? "Zu diesem Bereich gibt es Meldungen." : "Noch keine Pruefung vorhanden."),
        latestFailure: existing.latestFailure || "",
        incidentCount: incidentsByModule.get(moduleKey) || 0,
        lastCheckAt: existing.lastCheckAt || ""
      });
    });
  }

  function buildDashboardSummary({ runs = [], incidents = [], connections = [] } = {}) {
    const activeRuns = runs.filter((run) => run.archived !== true);
    const latestSmokeRun = activeRuns.find((run) => run.mode === "smoke") || null;
    const latestSyntheticRun = activeRuns.find((run) => run.packKey === "full-platform-pack" || run.mode === "synthetic") || null;
    const latestPersonaRun = activeRuns.find((run) => run.mode === "persona") || null;
    const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
    const criticalIncidents = activeIncidents.filter((incident) => incident.severity === "critical");
    const overallStatus = criticalIncidents.length
      ? "critical"
      : activeIncidents.length
        ? "warning"
        : [latestSmokeRun, latestSyntheticRun, latestPersonaRun].some((run) => run && ["failed", "critical"].includes(run.status))
          ? "warning"
          : "success";
    return {
      overallStatus,
      overallNote: criticalIncidents.length
        ? `${criticalIncidents.length} kritische Meldung(en) brauchen Aufmerksamkeit.`
        : activeIncidents.length
          ? `${activeIncidents.length} offene Meldung(en) werden beobachtet.`
          : "System stabil. Keine offenen Meldungen.",
      updatedAt: new Date().toISOString(),
      latestSmokeRun,
      latestSyntheticRun,
      latestPersonaRun,
      latestIncidents: incidents.slice(0, 8),
      recentRuns: activeRuns.slice(0, 12),
      moduleHealth: buildModuleHealth(activeRuns, incidents),
      liveMonitoringSummary: {
        activeIncidents: activeIncidents.length,
        criticalIncidents: criticalIncidents.length,
        latestFailure: asText(activeIncidents[0]?.title || latestSmokeRun?.summary || latestSyntheticRun?.summary)
      },
      connectionsPreview: connections.slice(0, 4),
      quickActions: [
        ...listHeartPackQuickActions(),
        { id: "refresh-heart", label: "Status neu laden", action: "refresh-heart", note: "Laedt Monitoring, Meldungen, Laeufe und Verbindungen neu." }
      ]
    };
  }

  function buildConnections({ githubConfig = null, runs = [], incidents = [] } = {}) {
    const latestRun = runs.find((run) => run.archived !== true) || null;
    const latestIncident = incidents[0] || null;
    const rateLimitedRun = runs.find((run) => isGithubRateLimited(run)) || null;
    const githubRateLimitDetail = rateLimitedRun?.github?.rateLimitedUntil
      ? `Zwischengespeichert bis ${rateLimitedRun.github.rateLimitedUntil}`
      : "GitHub-API ist begrenzt. Heart zeigt voruebergehend zwischengespeicherte Daten.";
    return [
      {
        id: "github-actions",
        name: "GitHub Actions Runner",
        kind: "github",
        status: !githubConfig?.configured ? "not_configured" : rateLimitedRun ? "warning" : "success",
        note: !githubConfig?.configured
          ? "Richte HEART_GITHUB_* ein, damit Heart Testlaeufe sicher starten kann."
          : rateLimitedRun
            ? "GitHub-API ist begrenzt. Heart zeigt bis zum Ende der Abkuehlzeit den letzten sicheren Stand."
            : "Sicherer Workflow-Start ist eingerichtet.",
        lastCheckedAt: new Date().toISOString(),
        mode: githubConfig?.configured ? "real" : "not-configured",
        detail: !githubConfig?.configured
          ? "Noch kein sicherer Runner eingerichtet."
          : rateLimitedRun
            ? githubRateLimitDetail
            : `${githubConfig.owner}/${githubConfig.repo}`
      },
      {
        id: "firebase-heart-store",
        name: "Firebase Heart Speicher",
        kind: "firebase",
        status: "success",
        note: "Laufhistorie und Meldungen werden in Firestore gespeichert.",
        lastCheckedAt: new Date().toISOString(),
        mode: "real",
        detail: latestRun ? `Letzter Lauf ${latestRun.id}` : "Noch keine Laeufe vorhanden."
      },
      {
        id: "runtime-monitoring",
        name: "Live-Monitoring",
        kind: "runtime",
        status: latestIncident && latestIncident.severity === "critical" ? "critical" : latestIncident ? "warning" : "success",
        note: latestIncident ? latestIncident.title : "Noch keine Meldungen vorhanden.",
        lastCheckedAt: latestIncident?.updatedAt || new Date().toISOString(),
        mode: "real",
        detail: latestIncident ? `${latestIncident.source}/${latestIncident.module}` : "Wartet auf Meldungen oder Monitoring-Daten."
      },
      {
        id: "sentry-adapter",
        name: "Sentry Adapter",
        kind: "sentry",
        status: "not_configured",
        note: "Platzhalter: Noch keine Sentry-Zugangsdaten hinterlegt.",
        lastCheckedAt: "",
        mode: "placeholder",
        detail: "Sicherer Platzhalter ohne freigegebene Secrets."
      }
    ];
  }

  return {
    listRuns,
    getRun,
    getSetup,
    getIncident,
    saveSetup,
    createQueuedRun,
    mergeRun,
    appendRunArtifacts,
    removeRunArtifact,
    updateRunArchive,
    appendTimelineEntry,
    saveRunReport,
    listIncidents,
    createIncident,
    removeArtifactLinksFromIncidents,
    deleteIncident,
    buildModuleHealth,
    buildDashboardSummary,
    buildConnections
  };
}

module.exports = {
  createHeartProviders
};
