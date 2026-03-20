"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {
  HEART_DEFAULT_REGION,
  asText,
  getHeartBaseUrl,
  normalizeStatus,
  parseRequestJson,
  verifyCeoRequest
} = require("./common");
const {
  cancelWorkflowRun,
  dispatchWorkflow,
  getWorkflowRun,
  listWorkflowArtifacts,
  listWorkflowJobs,
  normalizeJobsToTimeline,
  resolveGithubConfig,
  summarizeCurrentStep
} = require("./github");
const {
  normalizeGithubExecutionState
} = require("./shared-github-execution-state");
const {
  createHeartProviders
} = require("./providers");

const db = admin.firestore();
const githubConfig = resolveGithubConfig();
const providers = createHeartProviders({ db });

function sendJson(res, status, payload) {
  res.status(status).json({ ok: status < 400, ...payload });
}

function buildDispatchInputs(mode, runId, identity = {}) {
  return {
    heart_run_id: asText(runId),
    heart_mode: mode,
    heart_environment: "production",
    heart_actor_uid: asText(identity.user?.uid),
    heart_actor_email: asText(identity.user?.email),
    heart_actor_name: asText(identity.profile?.name || identity.user?.displayName || identity.user?.email),
    heart_base_url: getHeartBaseUrl(),
    social_base_url: asText(process.env.HEART_SOCIAL_BASE_URL) || "https://menyra.com/apps/menyra-social/"
  };
}

async function loadConnectionsSnapshot() {
  const [runs, incidents] = await Promise.all([
    providers.listRuns(12),
    providers.listIncidents(12)
  ]);
  return providers.buildConnections({ githubConfig, runs, incidents });
}

async function hydrateRunWithGithub(run) {
  if (!run?.github?.runId || !githubConfig.configured) return run;
  const githubRunId = asText(run.github.runId);
  if (!githubRunId) return run;
  const [githubRun, jobs, artifacts] = await Promise.all([
    getWorkflowRun(githubConfig, githubRunId),
    listWorkflowJobs(githubConfig, githubRunId),
    listWorkflowArtifacts(githubConfig, githubRunId)
  ]);
  const timeline = await normalizeJobsToTimeline(jobs);
  const currentStep = (await summarizeCurrentStep(jobs)) || run.currentStep;
  const next = await providers.saveRunReport(run.id, {
    ...run,
    status: await normalizeGithubExecutionState(githubRun?.status, githubRun?.conclusion, run.status),
    summary: asText(run.summary || githubRun?.display_title || githubRun?.name),
    currentStep,
    branch: asText(githubRun?.head_branch || run.branch),
    build: asText(githubRun?.head_sha || run.build),
    startedAt: asText(githubRun?.run_started_at || run.startedAt),
    endedAt: asText(githubRun?.updated_at || run.endedAt),
    github: {
      ...(run.github || {}),
      runId: githubRunId,
      runNumber: githubRun?.run_number,
      htmlUrl: asText(githubRun?.html_url),
      status: asText(githubRun?.status),
      conclusion: asText(githubRun?.conclusion),
      headBranch: asText(githubRun?.head_branch),
      headSha: asText(githubRun?.head_sha)
    },
    timeline: timeline.length ? timeline : run.timeline,
    artifacts: artifacts.map((artifact) => ({
      label: asText(artifact?.name, "Artifact"),
      kind: "github-artifact",
      url: asText(artifact?.archive_download_url),
      sizeLabel: artifact?.size_in_bytes ? `${Math.round(Number(artifact.size_in_bytes || 0) / 1024)} KB` : ""
    }))
  });
  return next;
}

async function heartGetDashboard(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;
  const [runs, incidents] = await Promise.all([
    providers.listRuns(20),
    providers.listIncidents(20)
  ]);
  const connections = providers.buildConnections({ githubConfig, runs, incidents });
  sendJson(res, 200, {
    data: providers.buildDashboardSummary({ runs, incidents, connections })
  });
}

async function heartGetRuns(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;
  const runs = await providers.listRuns(40);
  const hydrated = await Promise.all(runs.slice(0, 3).map((run) => hydrateRunWithGithub(run).catch(() => run)));
  const hydratedById = new Map(hydrated.map((run) => [run.id, run]));
  sendJson(res, 200, {
    items: runs.map((run) => hydratedById.get(run.id) || run),
    updatedAt: new Date().toISOString()
  });
}

async function heartGetRunDetail(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runId = asText(body.runId);
  if (!runId) {
    sendJson(res, 400, { error: "runId required" });
    return;
  }
  const run = await providers.getRun(runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return;
  }
  const detail = await hydrateRunWithGithub(run).catch(() => run);
  sendJson(res, 200, { detail });
}

async function heartGetIncidents(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;
  const items = await providers.listIncidents(100);
  sendJson(res, 200, {
    items,
    updatedAt: new Date().toISOString()
  });
}

async function heartGetConnections(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;
  const items = await loadConnectionsSnapshot();
  sendJson(res, 200, {
    items,
    updatedAt: new Date().toISOString()
  });
}

async function startRun(req, res, mode) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  if (!githubConfig.configured) {
    sendJson(res, 503, { error: "GitHub Actions integration is not configured." });
    return;
  }
  const queuedRun = await providers.createQueuedRun({
    mode,
    environment: "production",
    startedBy: asText(authResult.profile?.name || authResult.user?.displayName || authResult.user?.email),
    startedByUid: asText(authResult.user?.uid),
    startedByEmail: asText(authResult.user?.email),
    triggerSource: "heart-ui",
    summary: `${mode === "synthetic" ? "Full synthetic" : "Smoke"} run queued by CEO.`
  });
  try {
    const dispatchResult = await dispatchWorkflow(githubConfig, mode, buildDispatchInputs(mode, queuedRun.id, authResult));
    const updatedRun = await providers.mergeRun(queuedRun.id, {
      currentStep: "GitHub workflow dispatch accepted.",
      github: {
        workflowId: dispatchResult.workflowId,
        ref: dispatchResult.ref
      }
    });
    sendJson(res, 200, {
      run: updatedRun,
      message: `${mode === "synthetic" ? "Full synthetic" : "Smoke"} run started.`
    });
  } catch (error) {
    await providers.mergeRun(queuedRun.id, {
      status: "failed",
      currentStep: "Dispatch failed.",
      summary: asText(error?.message, "GitHub workflow dispatch failed."),
      endedAt: new Date().toISOString(),
      failureDetails: [{
        id: "dispatch_failure",
        module: "github",
        title: "Workflow dispatch failed",
        message: asText(error?.message),
        severity: "critical"
      }]
    });
    sendJson(res, 500, { error: asText(error?.message, "GitHub workflow dispatch failed.") });
  }
}

async function heartCancelRun(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runId = asText(body.runId);
  if (!runId) {
    sendJson(res, 400, { error: "runId required" });
    return;
  }
  const run = await providers.getRun(runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return;
  }
  if (!githubConfig.configured || !run.github?.runId) {
    sendJson(res, 400, { error: "This run cannot be cancelled through GitHub Actions." });
    return;
  }
  await cancelWorkflowRun(githubConfig, run.github.runId);
  const updated = await providers.mergeRun(runId, {
    status: "cancelled",
    currentStep: "Cancellation requested by CEO.",
    summary: "Run cancellation requested.",
    endedAt: new Date().toISOString()
  });
  sendJson(res, 200, { run: updated });
}

async function heartIngestRunStatus(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, {
    methods: ["POST"],
    allowWebhookSecret: true
  });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runId = asText(body.runId);
  if (!runId) {
    sendJson(res, 400, { error: "runId required" });
    return;
  }
  const patch = {
    mode: asText(body.mode),
    status: normalizeStatus(body.status, "running"),
    summary: asText(body.summary),
    currentStep: asText(body.currentStep || body.step),
    startedAt: asText(body.startedAt),
    endedAt: asText(body.endedAt),
    branch: asText(body.branch),
    build: asText(body.build),
    github: body.github && typeof body.github === "object" ? body.github : {}
  };
  const run = await providers.mergeRun(runId, patch);
  if (body.timelineEntry && typeof body.timelineEntry === "object") {
    await providers.appendTimelineEntry(runId, body.timelineEntry);
  }
  sendJson(res, 200, { run });
}

async function heartIngestRunReport(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, {
    methods: ["POST"],
    allowWebhookSecret: true
  });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runId = asText(body.runId || body.id);
  if (!runId) {
    sendJson(res, 400, { error: "runId required" });
    return;
  }
  const report = body.report && typeof body.report === "object" ? body.report : body;
  const saved = await providers.saveRunReport(runId, {
    ...report,
    id: runId
  });
  if (saved.failedChecks > 0) {
    await providers.createIncident({
      runId,
      source: saved.mode,
      module: saved.failureDetails?.[0]?.module || saved.mode,
      severity: saved.failedChecks > 0 ? "critical" : "info",
      title: `${saved.mode === "synthetic" ? "Synthetic" : "Smoke"} run reported failures`,
      message: saved.failureDetails?.[0]?.message || saved.summary,
      status: "open",
      environment: saved.environment,
      build: saved.build,
      actor: saved.startedBy,
      artifactLinks: saved.artifacts
    });
  }
  sendJson(res, 200, { run: saved });
}

async function heartIngestIncident(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, {
    methods: ["POST"],
    allowWebhookSecret: true
  });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const incident = await providers.createIncident(body);
  sendJson(res, 200, { incident });
}

module.exports = {
  heartGetDashboard: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetDashboard),
  heartGetRuns: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetRuns),
  heartGetRunDetail: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetRunDetail),
  heartGetIncidents: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetIncidents),
  heartGetConnections: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetConnections),
  heartStartSmokeRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "smoke")),
  heartStartSyntheticRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "synthetic")),
  heartCancelRun: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartCancelRun),
  heartIngestRunStatus: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunStatus),
  heartIngestRunReport: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunReport),
  heartIngestIncident: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestIncident)
};
