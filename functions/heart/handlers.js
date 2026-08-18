"use strict";

const admin = require("firebase-admin");
const Busboy = require("busboy");
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
  summarizeCurrentStep,
  deleteWorkflowArtifact
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
const {
  HEART_PERSONA_KEYS,
  searchRestaurants,
  provisionHeartAccounts,
  reconcileHeartAccounts,
  deleteProvisionedPersona,
  buildRunnerEnvPayload,
  deriveSetupPatch
} = require("./setup");
const {
  buildGoOperatorOverview
} = require("../go/generated/go-operator-core.cjs");
const {
  GO_PERIOD_DEFAULT,
  buildGoCohortFunnel,
  countGoVisitors,
  normalizeGoPeriod,
  resolveGoPeriodRange,
  sumGoEarnedCents
} = require("../go/generated/go-period-core.cjs");
const {
  GO_LEDGER_COLLECTION,
  allocateGoPaymentFifo,
  buildGoAllocationEntry,
  buildGoLedgerHistory,
  buildGoPaymentEntry,
  buildGoReversalEntry,
  sumGoLedgerBalance
} = require("../go/generated/go-ledger-core.cjs");
const {
  buildGoForecast,
  goExpectedRevenueCents,
  goFinalizationRates,
  goMedianFinalizationLatency
} = require("../go/generated/go-forecast-core.cjs");
const { goCommissionCents } = require("../go/generated/go-commission-core.cjs");
const { goDayKey } = require("../go/generated/go-time-core.cjs");

const db = admin.firestore();
const githubConfig = resolveGithubConfig();
const providers = createHeartProviders({ db });
const githubHydrationInflight = new Map();
const GITHUB_ACTIVE_HYDRATION_MS = 15 * 1000;
const GITHUB_DETAIL_HYDRATION_MS = 10 * 60 * 1000;
const GITHUB_RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000;
const HEART_ARTIFACT_MAX_FILE_BYTES = 32 * 1024 * 1024;

function createArtifactId() {
  return `artifact_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatArtifactSizeLabel(sizeBytes = 0) {
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

function sanitizeArtifactFileName(fileName = "", fallbackExtension = "") {
  const safeName = asText(fileName)
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 90);
  if (safeName) return safeName;
  const ext = asText(fallbackExtension).replace(/^\.+/, "");
  return ext ? `artifact.${ext}` : "artifact.bin";
}

function getArtifactExtension(fileName = "", contentType = "") {
  const safeName = asText(fileName);
  const directExtension = safeName.includes(".")
    ? safeName.split(".").pop().toLowerCase()
    : "";
  if (directExtension) return directExtension;
  const mime = asText(contentType).toLowerCase();
  const byMime = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/zip": "zip",
    "application/json": "json",
    "application/pdf": "pdf",
    "text/plain": "txt"
  };
  return byMime[mime] || "bin";
}

function createStorageDownloadUrl(bucketName = "", filePath = "", token = "") {
  if (!bucketName || !filePath || !token) return "";
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(filePath)}?alt=media&token=${encodeURIComponent(token)}`;
}

function isPreviewableArtifact(artifact = {}) {
  const kind = asText(artifact.kind).toLowerCase();
  const contentType = asText(artifact.contentType).toLowerCase();
  const url = asText(artifact.url);
  return kind === "screenshot"
    || contentType.startsWith("image/")
    || /\.(png|jpe?g|webp|gif|avif)$/i.test(url);
}

async function parseMultipartUpload(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: HEART_ARTIFACT_MAX_FILE_BYTES
      }
    });
    const fields = {};
    const chunks = [];
    let fileName = "";
    let contentType = "application/octet-stream";
    let hasFile = false;

    busboy.on("field", (name, value) => {
      fields[name] = asText(value);
    });

    busboy.on("file", (_fieldName, file, info) => {
      hasFile = true;
      fileName = asText(info?.filename, "artifact.bin");
      contentType = asText(info?.mimeType, "application/octet-stream");
      file.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    });

    busboy.on("error", reject);
    busboy.on("finish", () => {
      resolve({
        fields,
        fileName,
        contentType,
        buffer: hasFile ? Buffer.concat(chunks) : Buffer.alloc(0)
      });
    });

    req.pipe(busboy);
  });
}

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
    return true;
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
  const preferredWaiterBase = asText(body.waiterBaseUrl);
  const requestOrigin = asText(req.get("origin"));
  const configuredHeartBaseUrl = getHeartBaseUrl();
  const configuredSocialBaseUrl = asText(process.env.HEART_SOCIAL_BASE_URL)
    || readConfigValue("heart.social_base_url", "mnyra.heart_social_base_url");
  const configuredWaiterBaseUrl = asText(process.env.HEART_WAITER_BASE_URL)
    || readConfigValue("heart.waiter_base_url", "mnyra.heart_waiter_base_url");

  const heartBaseUrl = isRemoteHttpsUrl(preferredHeartBase)
    ? preferredHeartBase
    : isRemoteHttpsUrl(requestOrigin)
      ? new URL("/heart/", new URL(requestOrigin)).toString()
      : configuredHeartBaseUrl;

  if (isRemoteHttpsUrl(preferredSocialBase)) {
    return {
      heartBaseUrl,
      socialBaseUrl: preferredSocialBase,
      waiterBaseUrl: isRemoteHttpsUrl(preferredWaiterBase)
        ? preferredWaiterBase
        : (isRemoteHttpsUrl(configuredWaiterBaseUrl) ? configuredWaiterBaseUrl : "")
    };
  }

  if (isRemoteHttpsUrl(configuredSocialBaseUrl) && isRemoteHttpsUrl(configuredWaiterBaseUrl)) {
    return {
      heartBaseUrl,
      socialBaseUrl: configuredSocialBaseUrl,
      waiterBaseUrl: configuredWaiterBaseUrl
    };
  }

  // Preview deployments can sit behind Vercel auth; only derive social from the request
  // origin if no explicit public social base is configured.
  if (isRemoteHttpsUrl(requestOrigin)) {
    const origin = new URL(requestOrigin);
    return {
      heartBaseUrl,
      socialBaseUrl: isRemoteHttpsUrl(preferredSocialBase) ? preferredSocialBase : new URL("/social/", origin).toString(),
      waiterBaseUrl: isRemoteHttpsUrl(preferredWaiterBase) ? preferredWaiterBase : new URL("/waiter/", origin).toString()
    };
  }

  if (isRemoteHttpsUrl(heartBaseUrl)) {
    const heartOrigin = new URL(heartBaseUrl);
    return {
      heartBaseUrl,
      socialBaseUrl: isRemoteHttpsUrl(configuredSocialBaseUrl) ? configuredSocialBaseUrl : new URL("/social/", heartOrigin).toString(),
      waiterBaseUrl: isRemoteHttpsUrl(configuredWaiterBaseUrl) ? configuredWaiterBaseUrl : new URL("/waiter/", heartOrigin).toString()
    };
  }

  return {
    heartBaseUrl,
    socialBaseUrl: "https://www.mnyra.com/social/",
    waiterBaseUrl: "https://www.mnyra.com/waiter/"
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
    social_base_url: appBaseUrls.socialBaseUrl,
    waiter_base_url: appBaseUrls.waiterBaseUrl
  };
}

async function loadConnectionsSnapshot() {
  const [runs, incidents] = await Promise.all([
    providers.listRuns(12),
    providers.listIncidents(12)
  ]);
  return providers.buildConnections({ githubConfig, runs, incidents });
}

async function loadRestaurantById(restaurantId = "") {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) return null;
  const snap = await db.collection("restaurants").doc(safeRestaurantId).get().catch(() => null);
  if (!snap?.exists) return null;
  const data = snap.data() || {};
  return {
    id: snap.id,
    name: asText(data.name || data.restaurantName || snap.id),
    handle: asText(data.handle || data.name || data.restaurantName),
    ownerEmail: asText(data.ownerEmail),
    city: asText(data.city)
  };
}

async function buildHeartSetupState(req, patch = {}) {
  const currentSetup = await providers.getSetup();
  const baseUrls = deriveAppBaseUrls(req, patch);
  let nextSetup = deriveSetupPatch({
    setup: currentSetup,
    patch,
    socialBaseUrl: baseUrls.socialBaseUrl,
    waiterBaseUrl: baseUrls.waiterBaseUrl
  });
  const restaurantId = asText(nextSetup.restaurantId);
  const managedPersonas = nextSetup.personas && typeof nextSetup.personas === "object"
    ? Object.values(nextSetup.personas).filter((item) => item && item.managed === true)
    : [];
  if (restaurantId && managedPersonas.length) {
    const restaurant = await loadRestaurantById(restaurantId);
    if (restaurant?.id) {
      const reconciledSetup = await reconcileHeartAccounts({
        db,
        setup: nextSetup,
        restaurant
      });
      nextSetup = deriveSetupPatch({
        setup: reconciledSetup,
        socialBaseUrl: baseUrls.socialBaseUrl,
        waiterBaseUrl: baseUrls.waiterBaseUrl
      });
      await providers.saveSetup({
        ...nextSetup,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantHandle: restaurant.handle,
        restaurantQuery: asText(nextSetup.restaurantQuery || restaurant.name)
      }).catch(() => undefined);
    }
  }
  return {
    currentSetup,
    nextSetup,
    baseUrls
  };
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
          id: `github_artifact_${asText(artifact?.id) || createArtifactId()}`,
          label: asText(artifact?.name, "Artifact"),
          kind: "github-artifact",
          url: asText(artifact?.archive_download_url),
          sizeBytes: Math.max(0, Number(artifact?.size_in_bytes) || 0),
          sizeLabel: artifact?.size_in_bytes ? formatArtifactSizeLabel(artifact.size_in_bytes) : "",
          source: "github",
          githubArtifactId: asText(artifact?.id),
          deletable: true
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

async function heartGetSetup(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;
  const { nextSetup } = await buildHeartSetupState(req);
  sendJson(res, 200, { setup: nextSetup });
}

async function heartSaveSetup(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const restaurant = await loadRestaurantById(body.restaurantId);
  const patch = {};
  if ("restaurantId" in body) patch.restaurantId = asText(body.restaurantId);
  if ("restaurantName" in body || restaurant?.name) patch.restaurantName = asText(body.restaurantName || restaurant?.name);
  if ("restaurantHandle" in body || restaurant?.handle) patch.restaurantHandle = asText(body.restaurantHandle || restaurant?.handle);
  if ("restaurantQuery" in body || "restaurantName" in body || restaurant?.name || body.restaurantId) {
    patch.restaurantQuery = asText(body.restaurantQuery || body.restaurantName || restaurant?.name || body.restaurantId);
  }
  if ("guestRouteUrl" in body) patch.guestRouteUrl = asText(body.guestRouteUrl);
  if ("allowLiveMutations" in body) {
    patch.allowLiveMutations = body.allowLiveMutations === true || asText(body.allowLiveMutations).toLowerCase() === "true";
  }
  if ("syntheticIsolationKey" in body) patch.syntheticIsolationKey = asText(body.syntheticIsolationKey);
  const { nextSetup } = await buildHeartSetupState(req, patch);
  const saved = await providers.saveSetup(nextSetup);
  sendJson(res, 200, { setup: saved });
}

async function heartSearchRestaurants(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const query = asText(body.query);
  const baseUrls = deriveAppBaseUrls(req, body);
  const items = await searchRestaurants(db, query, {
    socialBaseUrl: baseUrls.socialBaseUrl
  });
  sendJson(res, 200, { items });
}

async function heartProvisionAccounts(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const requestedPersonas = Array.isArray(body.personas)
    ? body.personas.map((item) => asText(item)).filter((item) => HEART_PERSONA_KEYS.includes(item))
    : HEART_PERSONA_KEYS.slice();
  const basePatch = {
    restaurantId: asText(body.restaurantId),
    restaurantName: asText(body.restaurantName),
    restaurantHandle: asText(body.restaurantHandle),
    guestRouteUrl: asText(body.guestRouteUrl)
  };
  if ("allowLiveMutations" in body) {
    basePatch.allowLiveMutations = body.allowLiveMutations === true || asText(body.allowLiveMutations).toLowerCase() === "true";
  }
  const { nextSetup, baseUrls } = await buildHeartSetupState(req, basePatch);
  const restaurant = await loadRestaurantById(nextSetup.restaurantId);
  if (!restaurant?.id) {
    sendJson(res, 400, { error: "restaurantId required" });
    return;
  }
  const provisioned = await provisionHeartAccounts({
    db,
    setup: nextSetup,
    restaurant,
    personas: requestedPersonas
  });
  const finalSetup = deriveSetupPatch({
    setup: provisioned,
    socialBaseUrl: baseUrls.socialBaseUrl,
    waiterBaseUrl: baseUrls.waiterBaseUrl
  });
  const saved = await providers.saveSetup({
    ...finalSetup,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    restaurantHandle: restaurant.handle,
    restaurantQuery: restaurant.name
  });
  sendJson(res, 200, { setup: saved });
}

async function heartDeleteProvisionedPersona(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  sendJson(res, 409, {
    error: "Heart-Zielkonten bleiben dauerhaft bestehen und koennen nicht mehr aus Heart geloescht werden."
  });
}

async function heartUpdateRunArchive(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runIds = Array.isArray(body.runIds) ? body.runIds : [body.runId];
  const items = await providers.updateRunArchive(runIds, body.archived !== false);
  sendJson(res, 200, { items });
}

async function heartGetRunnerConfig(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, {
    methods: ["GET", "POST"],
    allowWebhookSecret: true
  });
  if (!authResult.ok) return;
  const body = req.method === "POST" ? parseRequestJson(req) : (req.query || {});
  const { nextSetup, baseUrls } = await buildHeartSetupState(req, body);
  sendJson(res, 200, {
    setup: nextSetup,
    env: buildRunnerEnvPayload({
      setup: nextSetup,
      socialBaseUrl: baseUrls.socialBaseUrl,
      waiterBaseUrl: baseUrls.waiterBaseUrl
    })
  });
}

async function heartUploadRunArtifact(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, {
    methods: ["POST"],
    allowWebhookSecret: true
  });
  if (!authResult.ok) return;

  const { fields, fileName, contentType, buffer } = await parseMultipartUpload(req);
  const runId = asText(fields.runId);
  if (!runId) {
    sendJson(res, 400, { error: "runId required" });
    return;
  }
  if (!buffer.length) {
    sendJson(res, 400, { error: "file required" });
    return;
  }

  const run = await providers.getRun(runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return;
  }

  const artifactId = createArtifactId();
  const extension = getArtifactExtension(fileName, contentType);
  const safeFileName = sanitizeArtifactFileName(fileName, extension);
  const storagePath = `heart-runs/${runId}/${artifactId}-${safeFileName}`;
  const token = createArtifactId();
  const bucket = admin.storage().bucket();
  if (!asText(bucket?.name)) {
    sendJson(res, 500, { error: "Firebase Storage bucket is not configured." });
    return;
  }
  const file = bucket.file(storagePath);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType: asText(contentType, "application/octet-stream"),
      cacheControl: isPreviewableArtifact({
        kind: fields.kind,
        contentType,
        url: safeFileName
      })
        ? "public,max-age=31536000,immutable"
        : "private,max-age=0,no-cache",
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const artifact = {
    id: artifactId,
    label: asText(fields.label, safeFileName),
    kind: asText(fields.kind, "artifact"),
    url: createStorageDownloadUrl(bucket.name, storagePath, token),
    previewUrl: isPreviewableArtifact({
      kind: fields.kind,
      contentType,
      url: safeFileName
    })
      ? createStorageDownloadUrl(bucket.name, storagePath, token)
      : "",
    sizeBytes: buffer.length,
    sizeLabel: formatArtifactSizeLabel(buffer.length),
    source: "storage",
    storagePath,
    bucket: bucket.name,
    fileName: safeFileName,
    contentType: asText(contentType, "application/octet-stream"),
    uploadedAt: new Date().toISOString(),
    deletable: true
  };

  await providers.appendRunArtifacts(runId, [artifact]);
  sendJson(res, 200, { artifact });
}

async function heartDeleteRunArtifact(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const runId = asText(body.runId);
  const artifactId = asText(body.artifactId);
  if (!runId || !artifactId) {
    sendJson(res, 400, { error: "runId and artifactId required" });
    return;
  }

  const run = await providers.getRun(runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return;
  }
  const artifact = Array.isArray(run.artifacts)
    ? run.artifacts.find((item) => asText(item.id) === artifactId)
    : null;
  if (!artifact) {
    sendJson(res, 404, { error: "Artifact not found" });
    return;
  }

  if (asText(artifact.storagePath)) {
    const artifactBucket = asText(artifact.bucket);
    const bucket = artifactBucket ? admin.storage().bucket(artifactBucket) : admin.storage().bucket();
    await bucket.file(asText(artifact.storagePath)).delete().catch(() => undefined);
  }
  if (asText(artifact.githubArtifactId)) {
    if (!githubConfig.configured) {
      sendJson(res, 503, { error: "GitHub Actions integration is not configured." });
      return;
    }
    try {
      await deleteWorkflowArtifact(githubConfig, artifact.githubArtifactId);
    } catch (error) {
      if (!/not found/i.test(asText(error?.message))) {
        sendJson(res, 502, { error: asText(error?.message, "GitHub artifact could not be deleted.") });
        return;
      }
    }
  }

  const result = await providers.removeRunArtifact(runId, artifactId);
  await providers.removeArtifactLinksFromIncidents(runId, result.artifact);
  sendJson(res, 200, {
    run: result.run,
    artifact: result.artifact
  });
}

async function heartDeleteIncident(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;
  const body = parseRequestJson(req);
  const incidentId = asText(body.incidentId);
  if (!incidentId) {
    sendJson(res, 400, { error: "incidentId required" });
    return;
  }
  const existing = await providers.getIncident(incidentId);
  if (!existing) {
    sendJson(res, 404, { error: "Incident not found" });
    return;
  }
  const incident = await providers.deleteIncident(incidentId);
  sendJson(res, 200, { incident });
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
    packLevel: asText(body.packLevel),
    packSummary: asText(body.packSummary),
    personas: Array.isArray(body.personas) ? body.personas : undefined,
    status: normalizeStatus(body.status, "running"),
    summary: asText(body.summary),
    currentStep: asText(body.currentStep || body.step),
    startedAt: asText(body.startedAt),
    endedAt: asText(body.endedAt),
    durationMs: body.durationMs,
    passedChecks: body.passedChecks,
    failedChecks: body.failedChecks,
    warningCount: body.warningCount,
    statusBreakdown: body.statusBreakdown && typeof body.statusBreakdown === "object" ? body.statusBreakdown : undefined,
    modules: Array.isArray(body.modules) ? body.modules : undefined,
    timeline: Array.isArray(body.timeline) ? body.timeline : undefined,
    createdEntities: Array.isArray(body.createdEntities) ? body.createdEntities : undefined,
    cleanup: body.cleanup && typeof body.cleanup === "object" ? body.cleanup : undefined,
    artifacts: Array.isArray(body.artifacts) ? body.artifacts : undefined,
    failureDetails: Array.isArray(body.failureDetails) ? body.failureDetails : undefined,
    runFlags: body.runFlags && typeof body.runFlags === "object" ? body.runFlags : undefined,
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


// ---------------------------------------------------------------------------
// Mnyra GO - was Mnyra selbst verdient.
//
// Die Zahlen entstehen hier auf dem Server und nicht im Browser. Nicht aus
// Vorsicht vor dem Betrachter - er ist der CEO -, sondern weil die Buchungen
// ueber alle Lokale verteilt liegen und die Regeln sie einem Browser gar
// nicht freigeben. Und weil eine Geldsumme, die im Browser entsteht, im
// Browser auch geaendert werden kann.
//
// Woher was kommt:
//   Zaehlungen  aus den Tagesdokumenten (goStats) - beilaeufig geschrieben,
//               fuer "wie oft" genau genug.
//   Betraege    aus den Buchungen selbst - dort ist der Posten in derselben
//               Transaktion entstanden wie die Bestaetigung.
// ---------------------------------------------------------------------------

const GO_OVERVIEW_MAX_DAYS = 400;
const GO_OVERVIEW_MAX_BOOKINGS = 5000;

// Die Zeitzone, in der Heart seine Zeitraeume absteckt.
//
// Ein Lokal sieht seinen eigenen Betriebstag; Heart sieht den Markt, und der
// Markt hat eine Zone (Punkt 56). Sie ist dieselbe wie die Standardzone der
// Lokale - solange Mnyra nicht ueber sie hinauswaechst, ist das dieselbe
// Antwort, und wenn doch, steht sie hier an einer Stelle.
const HEART_GO_MARKET_TIME_ZONE = "Europe/Belgrade";

// Ein Tagesschluessel, so viele Tage zurueck.
//
// Frueher rechnete das hier in UTC (toISOString), waehrend jeder dayKey, gegen
// den verglichen wird, in der Zone des LOKALS entstanden ist. Zwischen 00:00
// und 02:00 Ortszeit sind das zwei verschiedene Tage - am Rand jedes Zeitraums
// fehlte oder doppelte damit ein Tag. Bei dreissig Tagen faellt das niemandem
// auf; bei "Sot" und "Dje" waere es der falsche Tag.
function goDayKeyDaysAgo(days = 0, timeZone = HEART_GO_MARKET_TIME_ZONE) {
  const ms = Date.now() - Math.max(0, Math.trunc(Number(days) || 0)) * 24 * 60 * 60 * 1000;
  return goDayKey(ms, timeZone);
}

async function heartGetGoOverview(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;

  // Der Zeitraum. Ohne Angabe die letzten dreissig Tage - lang genug, um
  // einen Verlauf zu sehen, kurz genug, um nicht die ganze Geschichte zu
  // lesen.
  const rawDays = Math.trunc(Number(req.query?.days) || 0);
  const windowDays = rawDays > 0 ? Math.min(GO_OVERVIEW_MAX_DAYS, rawDays) : 30;
  const from = goDayKeyDaysAgo(windowDays - 1);
  const to = goDayKeyDaysAgo(0);

  const [statsSnapshot, bookingSnapshot] = await Promise.all([
    db.collectionGroup("goStats")
      .where("dayKey", ">=", from)
      .where("dayKey", "<=", to)
      .limit(GO_OVERVIEW_MAX_DAYS * 50)
      .get(),
    // Nur Buchungen, an denen ein Posten haengt. Eine Buchung ohne
    // Bestaetigung hat keinen - sie kostet das Lokal nichts und taucht in
    // einer Rechnung nicht auf.
    db.collection("goBookings")
      .where("commission.status", "in", ["pending", "settled"])
      .limit(GO_OVERVIEW_MAX_BOOKINGS)
      .get()
  ]);

  const days = [];
  statsSnapshot.forEach((doc) => {
    const data = doc.data() || {};
    days.push({
      restaurantId: String(data.restaurantId || doc.ref?.parent?.parent?.id || ""),
      impressions: data.impressions,
      accepted: data.accepted,
      confirmed: data.confirmed
    });
  });

  const commissions = [];
  const restaurantIds = new Set();
  bookingSnapshot.forEach((doc) => {
    const data = doc.data() || {};
    const restaurantId = String(data.restaurantId || "");
    if (restaurantId) restaurantIds.add(restaurantId);
    commissions.push({
      restaurantId,
      amountCents: data.commission?.amountCents,
      status: data.commission?.status
    });
  });
  days.forEach((day) => {
    if (day.restaurantId) restaurantIds.add(day.restaurantId);
  });

  // Die Namen der Lokale. Eine Kennung sagt niemandem etwas, wenn er
  // entscheiden soll, wen er anruft.
  const names = {};
  await Promise.all([...restaurantIds].map(async (id) => {
    try {
      const snapshot = await db.collection("restaurants").doc(id).get();
      const data = snapshot.exists ? (snapshot.data() || {}) : {};
      names[id] = String(data.name || data.restaurantName || "").trim();
    } catch {
      // Ohne Namen steht die Kennung da. Das ist haesslich, aber kein Grund,
      // die ganze Auskunft ausfallen zu lassen.
      names[id] = "";
    }
  }));

  sendJson(res, 200, {
    data: {
      range: { from, to, days: windowDays },
      ...buildGoOperatorOverview({ days, commissions, names })
    }
  });
}

// ---------------------------------------------------------------------------
// Mnyra GO - was Heart darueber hinaus sieht.
//
// Das Panel eines Lokals zeigt bewusst wenig (Punkt 62). Heart sieht dieselben
// Zahlen und dazu die, die eine Entscheidung tragen: was voraussichtlich
// hereinkommt, wo die Luecke zwischen Aktivieren und Finalisieren gross ist,
// und was offen steht.
//
// Gerechnet wird mit denselben Modulen wie im Panel. Wenn dort "Hapur 23,50 €"
// steht, steht es hier auch - nicht weil jemand abgeschrieben hat, sondern
// weil es dieselbe Rechnung ueber dieselben Zeilen ist (Punkt 54, Regel 13).
// ---------------------------------------------------------------------------

const GO_LEDGER_MAX_ENTRIES = 5000;

async function loadGoBookingsSince(fromMs) {
  const snapshot = await db.collection("goBookings")
    .where("createdAt", ">=", new Date(fromMs).toISOString())
    .limit(GO_OVERVIEW_MAX_BOOKINGS)
    .get()
    .catch(() => ({ docs: [] }));
  return snapshot.docs.map((doc) => ({ ...(doc.data() || {}), id: doc.id }));
}

async function loadGoLedger(restaurantId = "") {
  let query = db.collection(GO_LEDGER_COLLECTION);
  if (restaurantId) query = query.where("restaurantId", "==", String(restaurantId));
  const snapshot = await query.limit(GO_LEDGER_MAX_ENTRIES).get().catch(() => ({ docs: [] }));
  return snapshot.docs.map((doc) => ({ ...(doc.data() || {}), id: doc.id }));
}

// Die Namen der Lokale. Eine Kennung sagt niemandem etwas, wenn er entscheiden
// soll, wen er anruft.
async function loadGoRestaurantNames(ids = []) {
  const names = {};
  await Promise.all([...new Set(ids.filter(Boolean))].map(async (id) => {
    try {
      const snapshot = await db.collection("restaurants").doc(id).get();
      const data = snapshot.exists ? (snapshot.data() || {}) : {};
      names[id] = String(data.name || data.restaurantName || "").trim();
    } catch {
      names[id] = "";
    }
  }));
  return names;
}

function goBookingsOf(bookings, restaurantId) {
  return bookings.filter((booking) => String(booking.restaurantId || "") === restaurantId);
}

/**
 * Ein Lokal im Detail, mit allem, was Heart darueber weiss.
 */
function buildGoBusinessRow({ restaurantId, name, bookings, ledger, range, globalTotals, allBookings }) {
  const own = goBookingsOf(bookings, restaurantId);
  const funnel = buildGoCohortFunnel({ bookings: own, fromMs: range.fromMs, toMs: range.toMs });
  const visitors = countGoVisitors({ bookings: own, fromMs: range.fromMs, toMs: range.toMs });
  const earnedCents = sumGoEarnedCents({ bookings: own, fromMs: range.fromMs, toMs: range.toMs });

  // Die Quoten aus der GANZEN Historie des Lokals, nicht aus dem Zeitraum:
  // Eine Prognose fuer heute, die nur die Buchungen von heute kennt, ist im
  // Zweifel eine Prognose aus drei Zahlen.
  const lifetime = buildGoCohortFunnel({ bookings: own, fromMs: 0, toMs: Date.now() });
  const rates = goFinalizationRates({ own: lifetime, global: globalTotals });

  const openBookings = own.filter((booking) => {
    const status = String(booking.status || "");
    return status === "accepted" || status === "activated";
  });
  const expectedCents = goExpectedRevenueCents({
    openBookings,
    rates,
    commissionFor: (partySize) => goCommissionCents(partySize)
  });

  const balance = sumGoLedgerBalance(ledger.filter(
    (entry) => String(entry.restaurantId || "") === restaurantId
  ));

  return {
    restaurantId,
    name,
    ...funnel,
    visits: visitors.visits,
    visitors: visitors.visitors,
    ...buildGoForecast({ earnedCents, expectedCents, rates: { ...rates, sampleSize: lifetime.accepted } }),
    openCents: balance.openCents,
    settledCents: balance.settledCents,
    latency: goMedianFinalizationLatency(own),
    // Fuer die Kontroll-Frage: Wer aktiviert und nicht finalisiert, hatte
    // einen Gast im Lokal, der nichts gekostet hat. Es ist eine Quote und
    // kein Urteil (Punkt 60, 61).
    finalizeRatePercent: funnel.activated
      ? Math.round((funnel.finalized / funnel.activated) * 1000) / 10
      : 0
  };
}

async function heartGetGoBusiness(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;

  const period = normalizeGoPeriod(req.query?.period || GO_PERIOD_DEFAULT);
  const restaurantId = String(req.query?.restaurantId || "").trim();
  const range = resolveGoPeriodRange({
    period,
    nowMs: Date.now(),
    timeZone: HEART_GO_MARKET_TIME_ZONE
  });

  // Ein Jahr Vorlauf fuer die Quoten - sie sollen aus der Historie kommen und
  // nicht aus dem gewaehlten Zeitraum.
  const historyFromMs = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const [bookings, ledger] = await Promise.all([
    loadGoBookingsSince(Math.min(historyFromMs, range.fromMs)),
    loadGoLedger(restaurantId)
  ]);

  const globalTotals = buildGoCohortFunnel({ bookings, fromMs: 0, toMs: Date.now() });
  const ids = restaurantId
    ? [restaurantId]
    : [...new Set(bookings.map((booking) => String(booking.restaurantId || "")).filter(Boolean))];
  const names = await loadGoRestaurantNames(ids);

  const restaurants = ids.map((id) => buildGoBusinessRow({
    restaurantId: id,
    name: names[id] || "",
    bookings,
    ledger,
    range,
    globalTotals,
    allBookings: bookings
  })).sort((a, b) => (
    b.forecastCents - a.forecastCents
    || b.openCents - a.openCents
    || String(a.name || a.restaurantId).localeCompare(String(b.name || b.restaurantId))
  ));

  const totals = restaurants.reduce((sum, row) => ({
    accepted: sum.accepted + row.accepted,
    activated: sum.activated + row.activated,
    finalized: sum.finalized + row.finalized,
    visitors: sum.visitors + row.visitors,
    earnedCents: sum.earnedCents + row.earnedCents,
    forecastCents: sum.forecastCents + row.forecastCents,
    openCents: sum.openCents + row.openCents,
    settledCents: sum.settledCents + row.settledCents
  }), {
    accepted: 0, activated: 0, finalized: 0, visitors: 0,
    earnedCents: 0, forecastCents: 0, openCents: 0, settledCents: 0
  });

  sendJson(res, 200, {
    data: {
      period: range.key,
      from: new Date(range.fromMs).toISOString(),
      to: new Date(range.toMs).toISOString(),
      totals: { ...totals, restaurants: restaurants.length },
      restaurants
    }
  });
}

async function heartGetGoPayments(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["GET"] });
  if (!authResult.ok) return;

  const restaurantId = String(req.query?.restaurantId || "").trim();
  const ledger = await loadGoLedger(restaurantId);
  const balance = sumGoLedgerBalance(ledger);

  sendJson(res, 200, {
    data: {
      restaurantId,
      openCents: balance.openCents,
      settledCents: balance.settledCents,
      creditCents: balance.creditCents,
      history: buildGoLedgerHistory(ledger, { limit: 120 })
    }
  });
}

/**
 * Eine Zahlung eintragen.
 *
 * Sie wird auf die aeltesten offenen Gebuehren verteilt (Punkt 52) - der Wirt
 * sucht sich nicht aus, was er bezahlt. Geschrieben werden dabei zwei Arten
 * von Zeilen: die Zahlung selbst und je eine Zuordnung. Beide in einem
 * Stapel, damit es die Zahlung nicht ohne ihre Verteilung gibt.
 */
async function heartRegisterGoPayment(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;

  const body = req.body || {};
  const restaurantId = String(body.restaurantId || "").trim();
  const amountCents = Math.trunc(Number(body.amountCents) || 0);
  if (!restaurantId || amountCents <= 0) {
    return sendJson(res, 400, { error: "restaurantId and a positive amountCents are required." });
  }

  const ledger = await loadGoLedger(restaurantId);
  // Was von jeder Gebuehr noch offen ist: die Gebuehr minus dem, was ihr
  // bereits zugeordnet wurde.
  const allocatedByCharge = new Map();
  ledger.forEach((entry) => {
    if (entry.kind !== "allocation") return;
    const key = String(entry.chargeId || "");
    allocatedByCharge.set(key, (allocatedByCharge.get(key) || 0) + (Number(entry.amountCents) || 0));
  });
  const openCharges = ledger
    .filter((entry) => entry.kind === "charge")
    .map((entry) => ({
      id: entry.id,
      bookingId: entry.bookingId,
      amountCents: entry.amountCents,
      allocatedCents: allocatedByCharge.get(String(entry.id)) || 0,
      createdAt: entry.createdAt
    }));

  const plan = allocateGoPaymentFifo({ openCharges, amountCents });

  const batch = db.batch();
  const paymentRef = db.collection(GO_LEDGER_COLLECTION).doc();
  batch.set(paymentRef, buildGoPaymentEntry({
    restaurantId,
    amountCents,
    method: body.method,
    actorUid: authResult.uid || "",
    note: body.note,
    nowMs: Date.now()
  }));
  plan.allocations.forEach((allocation) => {
    batch.set(db.collection(GO_LEDGER_COLLECTION).doc(), buildGoAllocationEntry({
      restaurantId,
      paymentId: paymentRef.id,
      chargeId: allocation.chargeId,
      bookingId: allocation.bookingId,
      amountCents: allocation.amountCents,
      nowMs: Date.now()
    }));
  });
  await batch.commit();

  const after = sumGoLedgerBalance(await loadGoLedger(restaurantId));
  sendJson(res, 200, {
    data: {
      paymentId: paymentRef.id,
      allocatedCents: plan.allocatedCents,
      // Ein Ueberschuss verschwindet nicht - er steht beim naechsten Mal zur
      // Verfuegung, und Heart soll ihn sehen.
      remainderCents: plan.remainderCents,
      openCents: after.openCents,
      settledCents: after.settledCents
    }
  });
}

/**
 * Eine Zeile zuruecknehmen.
 *
 * Geloescht wird nichts (Regel 14). Die Ruecknahme steht daneben und traegt
 * einen Grund und einen Namen - wer das Buch spaeter liest, sieht beides.
 * Zu einer zurueckgenommenen Zahlung gehoeren auch ihre Zuordnungen, sonst
 * bliebe eine Gebuehr gedeckt, deren Geld weg ist.
 */
async function heartReverseGoPayment(req, res) {
  const authResult = await verifyCeoRequest(req, res, db, { methods: ["POST"] });
  if (!authResult.ok) return;

  const body = req.body || {};
  const restaurantId = String(body.restaurantId || "").trim();
  const paymentId = String(body.paymentId || "").trim();
  const reason = String(body.reason || "").trim();
  if (!restaurantId || !paymentId || !reason) {
    return sendJson(res, 400, { error: "restaurantId, paymentId and reason are required." });
  }

  const ledger = await loadGoLedger(restaurantId);
  const payment = ledger.find((entry) => entry.id === paymentId && entry.kind === "payment");
  if (!payment) return sendJson(res, 404, { error: "Payment was not found." });

  const batch = db.batch();
  batch.set(db.collection(GO_LEDGER_COLLECTION).doc(), buildGoReversalEntry({
    restaurantId,
    targetId: paymentId,
    targetKind: "payment",
    amountCents: payment.amountCents,
    reason,
    actorUid: authResult.uid || "",
    nowMs: Date.now()
  }));
  ledger
    .filter((entry) => entry.kind === "allocation" && String(entry.paymentId || "") === paymentId)
    .forEach((allocation) => {
      batch.set(db.collection(GO_LEDGER_COLLECTION).doc(), buildGoReversalEntry({
        restaurantId,
        targetId: allocation.id,
        targetKind: "allocation",
        amountCents: allocation.amountCents,
        reason,
        actorUid: authResult.uid || "",
        nowMs: Date.now()
      }));
    });
  await batch.commit();

  const after = sumGoLedgerBalance(await loadGoLedger(restaurantId));
  sendJson(res, 200, {
    data: { openCents: after.openCents, settledCents: after.settledCents }
  });
}

module.exports = {
  heartGetDashboard: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetDashboard),
  heartGetGoBusiness: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetGoBusiness),
  heartGetGoPayments: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetGoPayments),
  heartRegisterGoPayment: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartRegisterGoPayment),
  heartReverseGoPayment: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartReverseGoPayment),
  heartGetGoOverview: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetGoOverview),
  heartGetRuns: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetRuns),
  heartGetRunDetail: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetRunDetail),
  heartGetIncidents: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetIncidents),
  heartGetConnections: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetConnections),
  heartGetSetup: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetSetup),
  heartSaveSetup: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartSaveSetup),
  heartSearchRestaurants: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartSearchRestaurants),
  heartProvisionAccounts: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartProvisionAccounts),
  heartDeleteProvisionedPersona: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartDeleteProvisionedPersona),
  heartUpdateRunArchive: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartUpdateRunArchive),
  heartGetRunnerConfig: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartGetRunnerConfig),
  heartUploadRunArtifact: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartUploadRunArtifact),
  heartDeleteRunArtifact: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartDeleteRunArtifact),
  heartDeleteIncident: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartDeleteIncident),
  heartStartPackRun: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartStartPackRun),
  heartStartSmokeRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "smoke")),
  heartStartSyntheticRun: functions.region(HEART_DEFAULT_REGION).https.onRequest((req, res) => startRun(req, res, "full-platform-pack")),
  heartCancelRun: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartCancelRun),
  heartIngestRunStatus: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunStatus),
  heartIngestRunReport: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestRunReport),
  heartIngestIncident: functions.region(HEART_DEFAULT_REGION).https.onRequest(heartIngestIncident)
};
