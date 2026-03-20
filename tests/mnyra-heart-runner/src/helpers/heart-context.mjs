function nowIso() {
  return new Date().toISOString();
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

export function createHeartContext({
  runId,
  mode,
  environment = "production",
  startedBy = "automation"
} = {}) {
  const startedAt = nowIso();
  const report = {
    id: asText(runId),
    runId: asText(runId),
    mode: asText(mode, "smoke"),
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
    github: {}
  };
  const moduleMap = new Map();

  function syncCounters() {
    const modules = Array.from(moduleMap.values());
    report.modules = modules;
    report.passedChecks = modules.filter((item) => item.status === "success").length;
    report.failedChecks = modules.filter((item) => item.status === "failed" || item.status === "critical").length;
    report.warningCount = modules.filter((item) => item.status === "warning").length;
  }

  function addTimeline(title, status = "running", note = "") {
    report.timeline.push({
      id: `step_${report.timeline.length + 1}`,
      title,
      status,
      note,
      startedAt: nowIso(),
      endedAt: ["success", "warning", "failed", "critical", "cancelled"].includes(status) ? nowIso() : ""
    });
    report.currentStep = title;
  }

  function setModule(module, patch = {}) {
    const safeKey = asText(module, "unknown");
    const current = moduleMap.get(safeKey) || {
      module: safeKey,
      label: safeKey.toUpperCase(),
      status: "idle",
      note: "",
      latestFailure: "",
      incidentCount: 0,
      lastCheckAt: ""
    };
    const next = {
      ...current,
      ...patch,
      module: safeKey,
      label: patch.label || current.label || safeKey.toUpperCase(),
      lastCheckAt: nowIso()
    };
    moduleMap.set(safeKey, next);
    syncCounters();
    return next;
  }

  function passModule(module, note = "", extras = {}) {
    return setModule(module, {
      ...extras,
      status: "success",
      note: asText(note, extras.note || "Module check passed."),
      latestFailure: ""
    });
  }

  function warnModule(module, note = "", extras = {}) {
    return setModule(module, {
      ...extras,
      status: "warning",
      note: asText(note, extras.note || "Module check returned warnings.")
    });
  }

  function failModule(module, error, extras = {}) {
    const message = error instanceof Error ? error.message : asText(error, "Module check failed.");
    report.failureDetails.push({
      id: `failure_${report.failureDetails.length + 1}`,
      module,
      title: extras.title || `${module} check failed`,
      message,
      severity: extras.severity || "critical"
    });
    return setModule(module, {
      ...extras,
      status: extras.severity === "warning" ? "warning" : "failed",
      note: extras.note || message,
      latestFailure: message,
      incidentCount: Math.max(0, Number(extras.incidentCount) || 0)
    });
  }

  function addCreatedEntity(entity = {}) {
    report.createdEntities.push({
      id: asText(entity.id, `entity_${report.createdEntities.length + 1}`),
      type: asText(entity.type, "entity"),
      label: asText(entity.label, `Entity ${report.createdEntities.length + 1}`),
      status: asText(entity.status, "success"),
      summary: asText(entity.summary),
      cleanupStatus: asText(entity.cleanupStatus, "idle")
    });
  }

  function setCleanup(status = "idle", summary = "", items = []) {
    report.cleanup = {
      status,
      summary: asText(summary, "Cleanup updated."),
      items: Array.isArray(items) ? items : []
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
      ...github
    };
    if (github.headBranch) report.branch = asText(github.headBranch);
    if (github.headSha) report.build = asText(github.headSha);
  }

  function finalize() {
    report.endedAt = nowIso();
    report.durationMs = new Date(report.endedAt).getTime() - new Date(report.startedAt).getTime();
    if (report.failedChecks > 0) {
      report.status = "failed";
      report.summary = report.summary === "Run started."
        ? `${report.failedChecks} module check(s) failed.`
        : report.summary;
    } else if (report.warningCount > 0) {
      report.status = "warning";
      report.summary = report.summary === "Run started."
        ? `${report.warningCount} module check(s) reported warnings.`
        : report.summary;
    } else {
      report.status = "success";
      report.summary = report.summary === "Run started."
        ? "All module checks passed."
        : report.summary;
    }
    syncCounters();
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
    return structuredClone(report);
  }

  return {
    report,
    addTimeline,
    passModule,
    warnModule,
    failModule,
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
