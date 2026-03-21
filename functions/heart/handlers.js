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
  deleteProvisionedPersona,
  buildRunnerEnvPayload,
  deriveSetupPatch
} = require("./setup");

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
  const nextSetup = deriveSetupPatch({
    setup: currentSetup,
    patch,
    socialBaseUrl: baseUrls.socialBaseUrl,
    waiterBaseUrl: baseUrls.waiterBaseUrl
  });
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
