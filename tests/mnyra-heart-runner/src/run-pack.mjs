import path from "node:path";
import { chromium } from "playwright";
import config from "../playwright.config.js";
import { getRunnerEnv } from "./helpers/env.mjs";
import { createHeartContext } from "./helpers/heart-context.mjs";
import { captureArtifact } from "./helpers/social-app.mjs";
import { createPersonaRegistry } from "./personas/persona-registry.mjs";
import { resolvePackRunner } from "./packs/pack-registry.mjs";
import { writeHeartReport } from "./reporters/heart-json-reporter.mjs";
import { postHeartIncident, postHeartReport, postHeartStatus } from "./reporters/heart-webhook-client.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function main() {
  const requestedPackKey = asText(process.argv[2], process.env.HEART_PACK_KEY || "smoke");
  const env = await getRunnerEnv(requestedPackKey);
  const personas = createPersonaRegistry(env);
  const {
    pack,
    runPack
  } = resolvePackRunner(requestedPackKey);

  const heart = createHeartContext({
    runId: env.runId,
    mode: pack.mode,
    pack,
    environment: "production",
    startedBy: env.ceoEmail || "automation"
  });
  heart.attachGithub({
    runId: env.githubRunId,
    runNumber: env.githubRunNumber,
    repository: env.githubRepository,
    htmlUrl: env.githubRunId && env.githubRepository && env.githubServerUrl
      ? `${env.githubServerUrl}/${env.githubRepository}/actions/runs/${env.githubRunId}`
      : "",
    headBranch: env.githubRefName,
    headSha: env.githubSha
  });
  heart.setRunFlags({
    allowLiveMutations: !!env.allowLiveMutations,
    syntheticIsolationConfigured: !!env.syntheticIsolationKey,
    requestedPackKey,
    resolvedPackKey: pack.key,
    personas: Object.fromEntries(
      Object.entries(personas).map(([key, persona]) => [key, {
        configured: !!persona.configured,
        app: persona.app,
        baseUrl: persona.baseUrl,
        guestRouteUrl: persona.guestRouteUrl || ""
      }])
    )
  });

  async function emitStatus(currentStep, status = "running", note = "") {
    heart.setCurrentStep(currentStep);
    await postHeartStatus(env, {
      runId: env.runId,
      mode: pack.mode,
      packKey: pack.key,
      packLabel: pack.title,
      status,
      currentStep,
      summary: heart.getReport().summary,
      startedAt: heart.report.startedAt,
      github: heart.report.github,
      timelineEntry: note ? {
        title: currentStep,
        status,
        note,
        startedAt: new Date().toISOString(),
        endedAt: ["success", "warning", "failed", "critical", "cancelled", "skipped", "not_configured", "guarded"].includes(status)
          ? new Date().toISOString()
          : ""
      } : null
    });
  }

  let browser;
  let browserContext;
  let page;

  async function createScopedPage(label = "scope") {
    const scopedContext = await browser.newContext({ viewport: config.viewport });
    scopedContext.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    scopedContext.setDefaultTimeout(config.actionTimeoutMs);
    await scopedContext.tracing.start({
      screenshots: !!config.traceScreenshots,
      snapshots: !!config.traceSnapshots
    });
    const scopedPage = await scopedContext.newPage();
    return {
      page: scopedPage,
      async dispose() {
        const tracePath = path.resolve(env.artifactDir, `${label}-trace.zip`);
        await scopedContext.tracing.stop({ path: tracePath }).catch(() => undefined);
        heart.addArtifact({ label: `${label} trace`, kind: "trace", path: tracePath });
        await scopedContext.close().catch(() => undefined);
      }
    };
  }

  try {
    heart.setSummary(`${pack.title} booting.`);
    await emitStatus("Runner booting", "running", `Initializing ${pack.title}.`);

    browser = await chromium.launch({ headless: env.headless });
    browserContext = await browser.newContext({ viewport: config.viewport });
    browserContext.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    browserContext.setDefaultTimeout(config.actionTimeoutMs);
    await browserContext.tracing.start({
      screenshots: !!config.traceScreenshots,
      snapshots: !!config.traceSnapshots
    });
    page = await browserContext.newPage();

    await emitStatus(`${pack.title} running`, "running", pack.summary);
    await runPack({
      page,
      browser,
      env,
      heart,
      personas,
      pack,
      emitStatus,
      createScopedPage
    });

    heart.finalize();
    await emitStatus(
      heart.report.status === "success" ? "Run completed" : "Run completed with issues",
      heart.report.status,
      heart.report.summary
    );
  } catch (error) {
    heart.failModule("runner", error, {
      title: `${pack.title} execution failed`,
      severity: "critical",
      area: "runner",
      action: pack.key
    });
    heart.setSummary(asText(error?.message, `${pack.title} failed.`));
    heart.finalize();
    if (page) {
      const failureScreenshot = await captureArtifact(page, env, `${pack.key}-failure-state`).catch(() => "");
      if (failureScreenshot) {
        heart.addArtifact({ label: `${pack.title} failure screenshot`, kind: "screenshot", path: failureScreenshot });
      }
    }
    await postHeartIncident(env, {
      runId: env.runId,
      source: pack.key,
      module: "runner",
      severity: "critical",
      title: `${pack.title} failed`,
      message: asText(error?.stack || error?.message, `${pack.title} failed.`),
      status: "open",
      environment: "production",
      build: env.githubSha,
      actor: env.ceoEmail
    }).catch(() => undefined);
    await emitStatus("Run failed", "failed", asText(error?.message, `${pack.title} failed.`)).catch(() => undefined);
  } finally {
    if (browserContext) {
      const tracePath = path.resolve(env.artifactDir, `${pack.key}-trace.zip`);
      await browserContext.tracing.stop({ path: tracePath }).catch(() => undefined);
      heart.addArtifact({ label: `${pack.title} trace`, kind: "trace", path: tracePath });
    }
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    const report = heart.getReport();
    const reportPath = await writeHeartReport({ report, outputFile: env.outputFile });
    heart.addArtifact({ label: `${pack.title} report`, kind: "json", path: reportPath });
    await postHeartReport(env, {
      runId: env.runId,
      report: heart.getReport()
    }).catch(() => undefined);
  }

  const finalStatus = heart.getReport().status;
  process.exit(["failed", "critical"].includes(finalStatus) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
