"use strict";

const {
  asText,
  readConfigValue
} = require("./common");
const {
  normalizeGithubExecutionState
} = require("./shared-github-execution-state");
const {
  getHeartPack
} = require("./generated/heart-pack-catalog.cjs");

function buildApiHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mnyra-heart-control"
  };
}

function resolveGithubConfig() {
  const token = asText(process.env.HEART_GITHUB_TOKEN)
    || readConfigValue("heart.github_token", "mnyra.heart_github_token");
  const owner = asText(process.env.HEART_GITHUB_OWNER)
    || readConfigValue("heart.github_owner", "mnyra.heart_github_owner");
  const repo = asText(process.env.HEART_GITHUB_REPO)
    || readConfigValue("heart.github_repo", "mnyra.heart_github_repo");
  const smokeWorkflow = asText(process.env.HEART_GITHUB_SMOKE_WORKFLOW)
    || readConfigValue("heart.github_smoke_workflow", "mnyra.heart_github_smoke_workflow")
    || "mnyra-heart-smoke.yml";
  const syntheticWorkflow = asText(process.env.HEART_GITHUB_SYNTHETIC_WORKFLOW)
    || readConfigValue("heart.github_synthetic_workflow", "mnyra.heart_github_synthetic_workflow")
    || "mnyra-heart-synthetic.yml";
  const ref = asText(process.env.HEART_GITHUB_REF)
    || readConfigValue("heart.github_ref", "mnyra.heart_github_ref")
    || "main";
  const baseUrl = "https://api.github.com";
  return {
    token,
    owner,
    repo,
    smokeWorkflow,
    syntheticWorkflow,
    ref,
    baseUrl,
    configured: !!(token && owner && repo)
  };
}

async function githubRequest(config, path, {
  method = "GET",
  body = null
} = {}) {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is unavailable. Firebase Functions must run on Node 20.");
  }
  if (!config.configured) {
    throw new Error("GitHub Actions integration is not configured.");
  }
  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers: buildApiHeaders(config.token),
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  if (!response.ok) {
    throw new Error(asText(parsed?.message, `GitHub API ${response.status}`));
  }
  return parsed;
}

function resolveWorkflowId(config, modeOrPack = "smoke") {
  const pack = getHeartPack(modeOrPack);
  return pack.workflowMode === "synthetic" ? config.syntheticWorkflow : config.smokeWorkflow;
}

async function dispatchWorkflow(config, modeOrPack, inputs = {}) {
  const pack = getHeartPack(modeOrPack);
  const workflowId = resolveWorkflowId(config, pack.key);
  await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`,
    {
      method: "POST",
      body: {
        ref: config.ref,
        inputs
      }
    }
  );
  return {
    workflowId,
    ref: config.ref,
    mode: pack.mode,
    workflowMode: pack.workflowMode,
    packKey: pack.key
  };
}

async function listWorkflowRuns(config, workflowId, {
  branch = "",
  event = "",
  perPage = 10
} = {}) {
  const params = new URLSearchParams();
  if (branch) params.set("branch", branch);
  if (event) params.set("event", event);
  params.set("per_page", String(Math.max(1, Number(perPage) || 10)));
  const payload = await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/workflows/${encodeURIComponent(workflowId)}/runs?${params.toString()}`
  );
  return Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
}

function toTime(value = "") {
  const stamp = Date.parse(asText(value));
  return Number.isFinite(stamp) ? stamp : 0;
}

async function resolveDispatchedWorkflowRun(config, workflowId, {
  branch = "",
  dispatchedAfter = "",
  event = "workflow_dispatch",
  attempts = 6,
  delayMs = 1500
} = {}) {
  const minStamp = toTime(dispatchedAfter);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const runs = await listWorkflowRuns(config, workflowId, {
      branch,
      event,
      perPage: 10
    });
    const match = runs
      .filter((run) => !minStamp || toTime(run?.created_at) >= minStamp - 5000)
      .sort((left, right) => toTime(right?.created_at) - toTime(left?.created_at))[0];
    if (match) return match;
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

async function getWorkflowRun(config, githubRunId) {
  return githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/runs/${encodeURIComponent(githubRunId)}`
  );
}

async function listWorkflowJobs(config, githubRunId) {
  const payload = await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/runs/${encodeURIComponent(githubRunId)}/jobs?per_page=100`
  );
  return Array.isArray(payload?.jobs) ? payload.jobs : [];
}

async function listWorkflowArtifacts(config, githubRunId) {
  const payload = await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/runs/${encodeURIComponent(githubRunId)}/artifacts?per_page=100`
  );
  return Array.isArray(payload?.artifacts) ? payload.artifacts : [];
}

async function cancelWorkflowRun(config, githubRunId) {
  await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/runs/${encodeURIComponent(githubRunId)}/cancel`,
    { method: "POST" }
  );
  return { ok: true };
}

async function deleteWorkflowArtifact(config, githubArtifactId) {
  await githubRequest(
    config,
    `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/actions/artifacts/${encodeURIComponent(githubArtifactId)}`,
    { method: "DELETE" }
  );
  return { ok: true };
}

async function normalizeJobsToTimeline(jobs = []) {
  const rows = [];
  for (const [jobIndex, job] of jobs.entries()) {
    const jobTitle = asText(job?.name, `Job ${jobIndex + 1}`);
    const steps = Array.isArray(job?.steps) ? job.steps : [];
    if (!steps.length) {
      rows.push({
        id: asText(job?.id, `job-${jobIndex + 1}`),
        title: jobTitle,
        status: await normalizeGithubExecutionState(job?.status, job?.conclusion, "idle"),
        note: asText(job?.conclusion || job?.status),
        startedAt: asText(job?.started_at),
        endedAt: asText(job?.completed_at)
      });
      continue;
    }
    for (const [stepIndex, step] of steps.entries()) {
      rows.push({
        id: `${asText(job?.id, `job-${jobIndex + 1}`)}-${stepIndex + 1}`,
        title: `${jobTitle} / ${asText(step?.name, `Step ${stepIndex + 1}`)}`,
        status: await normalizeGithubExecutionState(step?.status, step?.conclusion, "idle"),
        note: asText(step?.conclusion || step?.status),
        startedAt: asText(step?.started_at),
        endedAt: asText(step?.completed_at)
      });
    }
  }
  return rows;
}

async function summarizeCurrentStep(jobs = []) {
  for (const job of jobs) {
    const steps = Array.isArray(job?.steps) ? job.steps : [];
    for (const step of steps) {
      const status = await normalizeGithubExecutionState(step?.status, step?.conclusion, "idle");
      if (status === "running") {
        return `${asText(job?.name, "Job")} / ${asText(step?.name, "Running")}`;
      }
    }
  }
  for (const job of jobs) {
    const status = await normalizeGithubExecutionState(job?.status, job?.conclusion, "idle");
    if (status === "running") return asText(job?.name);
  }
  return "";
}

module.exports = {
  resolveGithubConfig,
  dispatchWorkflow,
  listWorkflowRuns,
  resolveDispatchedWorkflowRun,
  getWorkflowRun,
  listWorkflowJobs,
  listWorkflowArtifacts,
  cancelWorkflowRun,
  deleteWorkflowArtifact,
  normalizeJobsToTimeline,
  summarizeCurrentStep
};
