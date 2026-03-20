const STATUS_WEIGHTS = Object.freeze({
  idle: 0,
  queued: 5,
  running: 10,
  success: 20,
  skipped: 25,
  not_configured: 30,
  guarded: 35,
  warning: 40,
  failed: 50,
  critical: 60,
  cancelled: 15
});

const TRACKED_CHECK_STATUSES = Object.freeze([
  "success",
  "warning",
  "failed",
  "critical",
  "skipped",
  "not_configured",
  "guarded"
]);

function nowIso() {
  return new Date().toISOString();
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeStatus(status = "", fallback = "idle") {
  const safeStatus = asText(status, fallback).toLowerCase();
  if (safeStatus === "not-configured" || safeStatus === "needs-setup") return "not_configured";
  return STATUS_WEIGHTS[safeStatus] !== undefined ? safeStatus : fallback;
}

function createStatusBreakdown() {
  return {
    success: 0,
    warning: 0,
    failed: 0,
    critical: 0,
    skipped: 0,
    not_configured: 0,
    guarded: 0
  };
}

function sortStatuses(left = "idle", right = "idle") {
  return (STATUS_WEIGHTS[right] || 0) - (STATUS_WEIGHTS[left] || 0);
}

function getWorstStatus(items = [], fallback = "idle") {
  const statuses = items
    .map((item) => normalizeStatus(item?.status, "idle"))
    .sort(sortStatuses);
  return statuses[0] || fallback;
}

function summarizeCheckCounts(counts = {}) {
  const parts = [];
  TRACKED_CHECK_STATUSES.forEach((status) => {
    const value = Math.max(0, Number(counts[status]) || 0);
    if (!value) return;
    if (status === "not_configured") {
      parts.push(`${value} need setup`);
      return;
    }
    parts.push(`${value} ${status.replaceAll("_", " ")}`);
  });
  return parts.join(", ");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createHeartContext({
  runId,
  mode,
  pack = null,
  environment = "production",
  startedBy = "automation"
} = {}) {
  const startedAt = nowIso();
  const safePack = pack && typeof pack === "object" ? pack : null;
  const report = {
    id: asText(runId),
    runId: asText(runId),
    mode: asText(safePack?.mode || mode, "smoke"),
    packKey: asText(safePack?.key || mode, "smoke"),
    packLabel: asText(safePack?.title || safePack?.label || mode, "Smoke Test"),
    packLevel: asText(safePack?.level),
    packSummary: asText(safePack?.summary),
    personas: Array.isArray(safePack?.personas) ? safePack.personas.slice() : [],
    source: "playwright",
    environment,
    status: "running",
    summary: "Run started.",
    triggerSource: "github-actions",
    startedBy,
    startedAt,
    endedAt: "",
    durationMs: 0,
    branch: "",
    build: "",
    passedChecks: 0,
    failedChecks: 0,
    warningCount: 0,
    currentStep: "Bootstrapping runner.",
    modules: [],
    timeline: [],
    createdEntities: [],
    cleanup: {
      status: "idle",
      summary: "No cleanup recorded yet.",
      items: []
    },
    artifacts: [],
    failureDetails: [],
    github: {},
    statusBreakdown: createStatusBreakdown(),
    runFlags: {}
  };
  const moduleMap = new Map();

  function syncCounters() {
    const modules = Array.from(moduleMap.values()).map((item) => clone(item));
    report.modules = modules;
    const nextBreakdown = createStatusBreakdown();
    modules.forEach((moduleEntry) => {
      (Array.isArray(moduleEntry.checks) ? moduleEntry.checks : []).forEach((check) => {
        const status = normalizeStatus(check?.status, "idle");
        if (nextBreakdown[status] !== undefined) {
          nextBreakdown[status] += 1;
        }
      });
    });
    report.statusBreakdown = nextBreakdown;
    report.passedChecks = nextBreakdown.success;
    report.failedChecks = nextBreakdown.failed + nextBreakdown.critical;
    report.warningCount = nextBreakdown.warning + nextBreakdown.guarded + nextBreakdown.not_configured + nextBreakdown.skipped;
  }

  function addTimeline(title, status = "running", note = "", extras = {}) {
    report.timeline.push({
      id: `step_${report.timeline.length + 1}`,
      title,
      status: normalizeStatus(status, "running"),
      note,
      module: asText(extras.module),
      area: asText(extras.area),
      persona: asText(extras.persona),
      startedAt: asText(extras.startedAt || nowIso()),
      endedAt: asText(
        extras.endedAt
        || (["success", "warning", "failed", "critical", "cancelled", "skipped", "not_configured", "guarded"].includes(normalizeStatus(status, "running"))
          ? nowIso()
          : "")
      )
    });
    report.currentStep = title;
  }

  function getOrCreateModuleEntry(module, extras = {}) {
    const safeKey = asText(module, "unknown");
    const current = moduleMap.get(safeKey) || {
      module: safeKey,
      label: asText(extras.label, safeKey.toUpperCase()),
      status: "idle",
      note: "",
      latestFailure: "",
      incidentCount: 0,
      lastCheckAt: "",
      checks: [],
      counts: createStatusBreakdown(),
      personas: []
    };
    return current;
  }

  function syncModuleSummary(module, entry) {
    const nextEntry = {
      ...entry,
      lastCheckAt: nowIso()
    };
    const checks = Array.isArray(nextEntry.checks) ? nextEntry.checks : [];
    const counts = createStatusBreakdown();
    checks.forEach((check) => {
      const status = normalizeStatus(check?.status, "idle");
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    nextEntry.counts = counts;
    nextEntry.status = getWorstStatus(checks, "idle");
    nextEntry.note = summarizeCheckCounts(counts) || asText(nextEntry.note, "No checks recorded.");
    const latestFailure = checks
      .filter((check) => ["failed", "critical"].includes(normalizeStatus(check?.status, "idle")))
      .map((check) => asText(check.note || check.action))
      .filter(Boolean)
      .pop();
    nextEntry.latestFailure = latestFailure || "";
    nextEntry.personas = [...new Set(checks.map((check) => asText(check.persona)).filter(Boolean))];
    moduleMap.set(module, nextEntry);
    syncCounters();
    return nextEntry;
  }

  function recordModuleCheck(module, {
    status = "success",
    action = "",
    note = "",
    area = "",
    persona = "",
    label = "",
    severity = "",
    meta = {}
  } = {}) {
    const safeModule = asText(module, "unknown");
    const safeStatus = normalizeStatus(status, "idle");
    const entry = getOrCreateModuleEntry(safeModule, { label });
    const check = {
      id: `${safeModule}_check_${entry.checks.length + 1}`,
      action: asText(action, `${safeModule} check ${entry.checks.length + 1}`),
      status: safeStatus,
      note: asText(note),
      area: asText(area || safeModule),
      persona: asText(persona),
      severity: asText(severity),
      startedAt: nowIso(),
      endedAt: nowIso(),
      meta: meta && typeof meta === "object" ? clone(meta) : {}
    };
    entry.checks = [...entry.checks, check];
    return syncModuleSummary(safeModule, entry);
  }

  function passModule(module, note = "", extras = {}) {
    return recordModuleCheck(module, {
      ...extras,
      status: "success",
      note: asText(note, extras.note || "Check passed.")
    });
  }

  function warnModule(module, note = "", extras = {}) {
    return recordModuleCheck(module, {
      ...extras,
      status: "warning",
      note: asText(note, extras.note || "Check reported a warning.")
    });
  }

  function skipModule(module, note = "", extras = {}) {
    return recordModuleCheck(module, {
      ...extras,
      status: "skipped",
      note: asText(note, extras.note || "Check was skipped.")
    });
  }

  function notConfiguredModule(module, note = "", extras = {}) {
    return recordModuleCheck(module, {
      ...extras,
      status: "not_configured",
      note: asText(note, extras.note || "Check needs setup.")
    });
  }

  function guardModule(module, note = "", extras = {}) {
    return recordModuleCheck(module, {
      ...extras,
      status: "guarded",
      note: asText(note, extras.note || "Check is guarded and was not executed.")
    });
  }

  function failModule(module, error, extras = {}) {
    const safeStatus = extras.severity === "critical" ? "critical" : "failed";
    const message = error instanceof Error ? error.message : asText(error, "Check failed.");
    report.failureDetails.push({
      id: `failure_${report.failureDetails.length + 1}`,
      module,
      area: asText(extras.area || module),
      action: asText(extras.action || extras.title),
      title: asText(extras.title || `${module} check failed`),
      message,
      severity: extras.severity || "critical",
      persona: asText(extras.persona)
    });
    return recordModuleCheck(module, {
      ...extras,
      status: safeStatus,
      note: asText(extras.note || message),
      severity: asText(extras.severity || "critical")
    });
  }

  function setRunFlags(flags = {}) {
    report.runFlags = {
      ...(report.runFlags || {}),
      ...(flags && typeof flags === "object" ? clone(flags) : {})
    };
  }

  function addCreatedEntity(entity = {}) {
    report.createdEntities.push({
      id: asText(entity.id, `entity_${report.createdEntities.length + 1}`),
      type: asText(entity.type, "entity"),
      label: asText(entity.label, `Entity ${report.createdEntities.length + 1}`),
      status: asText(entity.status, "success"),
      summary: asText(entity.summary),
      cleanupStatus: asText(entity.cleanupStatus, "idle"),
      module: asText(entity.module),
      persona: asText(entity.persona)
    });
  }

  function setCleanup(status = "idle", summary = "", items = []) {
    report.cleanup = {
      status: normalizeStatus(status, "idle"),
      summary: asText(summary, "Cleanup updated."),
      items: Array.isArray(items) ? clone(items) : []
    };
  }

  function addArtifact(artifact = {}) {
    report.artifacts.push({
      label: asText(artifact.label, `Artifact ${report.artifacts.length + 1}`),
      kind: asText(artifact.kind, "artifact"),
      url: asText(artifact.url || artifact.path),
      sizeLabel: asText(artifact.sizeLabel)
    });
  }

  function attachGithub(github = {}) {
    report.github = {
      ...report.github,
      ...clone(github)
    };
    if (github.headBranch) report.branch = asText(github.headBranch);
    if (github.headSha) report.build = asText(github.headSha);
  }

  function finalize() {
    syncCounters();
    report.endedAt = nowIso();
    report.durationMs = new Date(report.endedAt).getTime() - new Date(report.startedAt).getTime();

    if (report.statusBreakdown.critical > 0) {
      report.status = "critical";
    } else if (report.statusBreakdown.failed > 0) {
      report.status = "failed";
    } else if (
      report.statusBreakdown.warning > 0
      || report.statusBreakdown.guarded > 0
      || report.statusBreakdown.not_configured > 0
      || report.statusBreakdown.skipped > 0
    ) {
      report.status = "warning";
    } else {
      report.status = "success";
    }

    if (report.summary === "Run started.") {
      const parts = [];
      if (report.passedChecks) parts.push(`${report.passedChecks} worked`);
      if (report.failedChecks) parts.push(`${report.failedChecks} failed`);
      if (report.statusBreakdown.warning) parts.push(`${report.statusBreakdown.warning} warned`);
      if (report.statusBreakdown.skipped) parts.push(`${report.statusBreakdown.skipped} skipped`);
      if (report.statusBreakdown.not_configured) parts.push(`${report.statusBreakdown.not_configured} need setup`);
      if (report.statusBreakdown.guarded) parts.push(`${report.statusBreakdown.guarded} guarded`);
      report.summary = parts.length ? parts.join(", ") : "No checks were recorded.";
    }
    return report;
  }

  function setSummary(summary = "") {
    report.summary = asText(summary, report.summary);
  }

  function setCurrentStep(step = "") {
    report.currentStep = asText(step, report.currentStep);
  }

  function getReport() {
    syncCounters();
    return clone(report);
  }

  return {
    report,
    addTimeline,
    passModule,
    warnModule,
    skipModule,
    notConfiguredModule,
    guardModule,
    failModule,
    recordModuleCheck,
    setRunFlags,
    addCreatedEntity,
    setCleanup,
    addArtifact,
    attachGithub,
    finalize,
    setSummary,
    setCurrentStep,
    getReport
  };
}
