"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {
  HEART_DEFAULT_REGION,
  asText,
  getHeartBaseUrl,
  readConfigValue,
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
  resolveDispatchedWorkflowRun,
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
const {
  getHeartPack
} = require("./generated/heart-pack-catalog.cjs");

const db = admin.firestore();
const githubConfig = resolveGithubConfig();
const providers = createHeartProviders({ db });
const githubHydrationInflight = new Map();
const GITHUB_ACTIVE_HYDRATION_MS = 15 * 1000;
const GITHUB_DETAIL_HYDRATION_MS = 10 * 60 * 1000;
const GITHUB_RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000;

function sendJson(res, status, payload) {
  res.status(status).json({ ok: status < 400, ...payload });
}

function toTimestamp(value = "") {
  const stamp = Date.parse(asText(value));
  return Number.isFinite(stamp) ? stamp : 0;
}

function isRunActive(run = {}) {
  const status = normalizeStatus(run?.status, "idle");
  const githubStatus = asText(run?.github?.status).toLowerCase();
  return status === "queued"
    || status === "running"
    || githubStatus === "queued"
    || githubStatus === "in_progress"
    || githubStatus === "requested"
    || githubStatus === "waiting";
}

function hasRunDetailGaps(run = {}) {
  const timeline = Array.isArray(run?.timeline) ? run.timeline : [];
  const artifacts = Array.isArray(run?.artifacts) ? run.artifacts : [];
  return timeline.length === 0 || artifacts.length === 0;
}

function isGithubRateLimitError(error) {
  return /rate limit exceeded/i.test(asText(error?.message));
}

function shouldHydrateRunFromGithub(run = {}, {
  detail = false
} = {}) {
  if (!run?.github?.runId || !githubConfig.configured) return false;
  const now = Date.now();
  const rateLimitedUntil = toTimestamp(run?.github?.rateLimitedUntil);
  if (rateLimitedUntil && rateLimitedUntil > now) return false;

  const lastHydratedAt = toTimestamp(run?.github?.lastHydratedAt || run?.updatedAt);
  const hydrationAgeMs = lastHydratedAt ? now - lastHydratedAt : Number.POSITIVE_INFINITY;
  const active = isRunActive(run);

  if (!detail) {
    return active && hydrationAgeMs >= GITHUB_ACTIVE_HYDRATION_MS;
  }

  if (active) {
    return hydrationAgeMs >= GITHUB_ACTIVE_HYDRATION_MS;
  }

  if (hasRunDetailGaps(run)) {
    return hydrationAgeMs >= GITHUB_ACTIVE_HYDRATION_MS;
  }

  return hydrationAgeMs >= GITHUB_DETAIL_HYDRATION_MS;
}

async function markRunGithubRateLimited(run, scope = "summary") {
  const nowIso = new Date().toISOString();
  const rateLimitedUntil = new Date(Date.now() + GITHUB_RATE_LIMIT_COOLDOWN_MS).toISOString();
  try {
    return await providers.mergeRun(run.id, {
      currentStep: "GitHub-API ist begrenzt. Heart nutzt voruebergehend zwischengespeicherte Workflow-Daten.",
      github: {
        ...(run.github || {}),
        rateLimitedAt: nowIso,
        rateLimitedUntil,
        lastHydrationScope: asText(scope, "summary")
      }
    });
  } catch {
    return {
      ...run,
      currentStep: "GitHub-API ist begrenzt. Heart nutzt voruebergehend zwischengespeicherte Workflow-Daten.",
      github: {
        ...(run.github || {}),
        rateLimitedAt: nowIso,
        rateLimitedUntil,
        lastHydrationScope: asText(scope, "summary")
      }
    };
  }
}

function isRemoteHttpsUrl(value = "") {
  try {
    const url = new URL(asText(value));
    if (url.protocol !== "https:") return false;
    return !/^(localhost|127(?:\.\d{1,3}){3})$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function deriveAppBaseUrls(req, body = {}) {
  const preferredHeartBase = asText(body.heartBaseUrl);
  const preferredSocialBase = asText(body.socialBaseUrl);
  const requestOrigin = asText(req.get("origin"));
  const configuredHeartBaseUrl = getHeartBaseUrl();
  const configuredSocialBaseUrl = asText(process.env.HEART_SOCIAL_BASE_URL)
    || readConfigValue("heart.social_base_url", "mnyra.heart_social_base_url");

  const heartBaseUrl = isRemoteHttpsUrl(preferredHeartBase)
    ? preferredHeartBase
    : isRemoteHttpsUrl(requestOrigin)
      ? new URL("/heart/", new URL(requestOrigin)).toString()
      : configuredHeartBaseUrl;

  if (isRemoteHttpsUrl(preferredSocialBase)) {
    return {
      heartBaseUrl,
      socialBaseUrl: preferredSocialBase
    };
  }

  if (isRemoteHttpsUrl(configuredSocialBaseUrl)) {
    return {
      heartBaseUrl,
      socialBaseUrl: configuredSocialBaseUrl
    };
  }

  // Preview deployments can sit behind Vercel auth; only derive social from the request
  // origin if no explicit public social base is configured.
  if (isRemoteHttpsUrl(requestOrigin)) {
    const origin = new URL(requestOrigin);
    return {
      heartBaseUrl,
      socialBaseUrl: new URL("/social/", origin).toString()
    };
  }

  if (isRemoteHttpsUrl(heartBaseUrl)) {
    const heartOrigin = new URL(heartBaseUrl);
    return {
      heartBaseUrl,
      socialBaseUrl: new URL("/social/", heartOrigin).toString()
    };
  }

  return {
    heartBaseUrl,
    socialBaseUrl: "https://menyra-test.vercel.app/social/"
  };
}

function buildDispatchInputs(req, body, mode, runId, identity = {}) {
  const pack = getHeartPack(body.packKey || mode);
  const appBaseUrls = deriveAppBaseUrls(req, body);
  return {
    heart_run_id: asText(runId),
    heart_mode: asText(pack.mode, mode),
    heart_pack: pack.key,
    heart_environment: "production",
    heart_actor_uid: asText(identity.user?.uid),
    heart_actor_email: asText(identity.user?.email),
    heart_actor_name: asText(identity.profile?.name || identity.user?.displayName || identity.user?.email),
    heart_base_url: appBaseUrls.heartBaseUrl,
    social_base_url: appBaseUrls.socialBaseUrl
  };
}

async function loadConnectionsSnapshot() {
  const [runs, incidents] = await Promise.all([
    providers.listRuns(12),
    providers.listIncidents(12)
  ]);
  return providers.buildConnections({ githubConfig, runs, incidents });
}

async function hydrateRunWithGithub(run, {
  detail = false
} = {}) {
  if (!run?.github?.runId || !githubConfig.configured) return run;
  const githubRunId = asText(run.github.runId);
  if (!githubRunId) return run;
  if (!shouldHydrateRunFromGithub(run, { detail })) {
    return run;
  }

  const inflightKey = `${asText(run.id)}:${detail ? "detail" : "summary"}`;
  if (githubHydrationInflight.has(inflightKey)) {
    return githubHydrationInflight.get(inflightKey);
  }

  const hydrationPromise = (async () => {
    try {
      const githubRun = await getWorkflowRun(githubConfig, githubRunId);
      const patch = {
        ...run,
        status: await normalizeGithubExecutionState(githubRun?.status, githubRun?.conclusion, run.status),
        summary: asText(run.summary || githubRun?.display_title || githubRun?.name),
        currentStep: isRunActive(run)
          ? asText(run.currentStep || "GitHub-Workflow laeuft.")
          : run.currentStep,
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
          headSha: asText(githubRun?.head_sha),
          lastHydratedAt: new Date().toISOString(),
          lastHydrationScope: detail ? "detail" : "summary",
          rateLimitedAt: "",
          rateLimitedUntil: ""
        }
      };

      if (detail) {
        const [jobs, artifacts] = await Promise.all([
          listWorkflowJobs(githubConfig, githubRunId),
          listWorkflowArtifacts(githubConfig, githubRunId)
        ]);
        const timeline = await normalizeJobsToTimeline(jobs);
        patch.currentStep = (await summarizeCurrentStep(jobs)) || patch.currentStep;
        patch.timeline = timeline.length ? timeline : run.timeline;
        patch.artifacts = artifacts.map((artifact) => ({
          label: asText(artifact?.name, "Artifact"),
          kind: "github-artifact",
          url: asText(artifact?.archive_download_url),
          sizeLabel: artifact?.size_in_bytes ? `${Math.round(Number(artifact.size_in_bytes || 0) / 1024)} KB` : ""
        }));
      }

      return providers.saveRunReport(run.id, patch);
    } catch (error) {
      if (isGithubRateLimitError(error)) {
        return markRunGithubRateLimited(run, detail ? "detail" : "summary");
      }
      throw error;
    } finally {
      githubHydrationInflight.delete(inflightKey);
    }
  })();

  githubHydrationInflight.set(inflightKey, hydrationPromise);
  return hydrationPromise;
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
  const hydrated = await Promise.all(
    runs
      .filter((run) => shouldHydrateRunFromGithub(run, { detail: false }))
      .slice(0, 3)
      .map((run) => hydrateRunWithGithub(run, { detail: false }).catch(() => run))
  );
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
  const detail = await hydrateRunWithGithub(run, { detail: true }).catch(() => run);
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

async function startRun(req, res, requestedPackKey) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const pack = getHeartPack(body.packKey || requestedPackKey);
  if (!githubConfig.configured) {
    sendJson(res, 503, { error: "GitHub Actions integration is not configured." });
    return;
  }
  const queuedRun = await providers.createQueuedRun({
    mode: pack.mode,
    packKey: pack.key,
    packLabel: pack.title,
    packLevel: pack.level,
    packSummary: pack.summary,
    personas: pack.personas,
    environment: "production",
    startedBy: asText(authResult.profile?.name || authResult.user?.displayName || authResult.user?.email),
    startedByUid: asText(authResult.user?.uid),
    startedByEmail: asText(authResult.user?.email),
    triggerSource: "heart-ui",
      summary: `${pack.title} wurde vom CEO in die Warteschlange gestellt.`
  });
  try {
    const dispatchResult = await dispatchWorkflow(githubConfig, pack.key, buildDispatchInputs(req, body, pack.mode, queuedRun.id, authResult));
    const githubRun = await resolveDispatchedWorkflowRun(githubConfig, dispatchResult.workflowId, {
      branch: dispatchResult.ref,
      dispatchedAfter: queuedRun.startedAt
    }).catch(() => null);
    const updatedRun = await providers.mergeRun(queuedRun.id, {
      github: {
        workflowId: dispatchResult.workflowId,
        ref: dispatchResult.ref,
        runId: asText(githubRun?.id),
        runNumber: githubRun?.run_number,
        htmlUrl: asText(githubRun?.html_url),
        status: asText(githubRun?.status),
        conclusion: asText(githubRun?.conclusion),
        headBranch: asText(githubRun?.head_branch),
        headSha: asText(githubRun?.head_sha)
      },
      packKey: pack.key,
      packLabel: pack.title,
      packLevel: pack.level,
      packSummary: pack.summary,
      personas: pack.personas,
      branch: asText(githubRun?.head_branch || dispatchResult.ref),
      build: asText(githubRun?.head_sha),
    currentStep: asText(githubRun?.id ? "GitHub-Workflow wartet." : "GitHub-Workflow wurde angenommen.")
    });
    sendJson(res, 200, {
      run: updatedRun,
      message: `${pack.title} started.`
    });
  } catch (error) {
    await providers.mergeRun(queuedRun.id, {
      status: "failed",
      currentStep: "Start an GitHub fehlgeschlagen.",
      summary: asText(error?.message, "GitHub-Workflow konnte nicht gestartet werden."),
      endedAt: new Date().toISOString(),
      failureDetails: [{
        id: "dispatch_failure",
        module: "github",
      title: "GitHub-Workflow konnte nicht gestartet werden",
        message: asText(error?.message),
        severity: "critical"
      }]
    });
    sendJson(res, 500, { error: asText(error?.message, "GitHub-Workflow konnte nicht gestartet werden.") });
  }
}

async function heartStartPackRun(req, res) {
  const body = parseRequestJson(req);
  return startRun(req, res, asText(body.packKey, "smoke"));
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
      summary: "Abbruch wurde angefragt.",
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
    packKey: asText(body.packKey),
    packLabel: asText(body.packLabel),
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
  heartStartPackRun: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartStartPackRun),
  heartStartSmokeRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "smoke")),
  heartStartSyntheticRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "full-platform-pack")),
  heartCancelRun: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartCancelRun),
  heartIngestRunStatus: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunStatus),
  heartIngestRunReport: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunReport),
  heartIngestIncident: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestIncident)
};
