import path from "node:path";
import { chromium } from "playwright";
import config from "../playwright.config.js";
import { getRunnerEnv, requireCredentials } from "./helpers/env.mjs";
import { createHeartContext } from "./helpers/heart-context.mjs";
import { captureArtifact } from "./helpers/social-app.mjs";
import { writeHeartReport } from "./reporters/heart-json-reporter.mjs";
import { postHeartIncident, postHeartReport, postHeartStatus } from "./reporters/heart-webhook-client.mjs";
import { runSmokeScenario } from "./scenarios/smoke.spec.mjs";
import { runSyntheticScenario } from "./scenarios/full-synthetic.spec.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function main() {
  const mode = asText(process.argv[2], "smoke");
  const env = await getRunnerEnv(mode);
  requireCredentials(env);

  const heart = createHeartContext({
    runId: env.runId,
    mode,
    environment: "production",
    startedBy: env.ceoEmail
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

  async function emitStatus(currentStep, status = "running", note = "") {
    heart.setCurrentStep(currentStep);
    await postHeartStatus(env, {
      runId: env.runId,
      mode,
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
        endedAt: ["success", "warning", "failed", "critical", "cancelled"].includes(status) ? new Date().toISOString() : ""
      } : null
    });
  }

  let browser;
  let browserContext;
  let page;

  try {
    heart.setSummary(`${mode === "synthetic" ? "Full synthetic" : "Smoke"} runner booting.`);
    await emitStatus("Runner booting", "running", "Initializing Playwright browser context.");

    browser = await chromium.launch({ headless: env.headless });
    browserContext = await browser.newContext({ viewport: config.viewport });
    browserContext.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    browserContext.setDefaultTimeout(config.actionTimeoutMs);
    await browserContext.tracing.start({
      screenshots: !!config.traceScreenshots,
      snapshots: !!config.traceSnapshots
    });
    page = await browserContext.newPage();

    if (mode === "synthetic") {
      await emitStatus("Synthetic scenario running", "running", "Executing full synthetic scenario pack.");
      await runSyntheticScenario({ page, env, heart, emitStatus });
    } else {
      await emitStatus("Smoke scenario running", "running", "Executing smoke scenario pack.");
      await runSmokeScenario({ page, env, heart, emitStatus });
    }

    heart.finalize();
    await emitStatus(
      heart.report.status === "success" ? "Run completed" : "Run completed with warnings",
      heart.report.status,
      heart.report.summary
    );
  } catch (error) {
    heart.failModule(mode === "synthetic" ? "synthetic" : "smoke", error, {
      title: `${mode} runner execution failed`,
      severity: "critical"
    });
    heart.setSummary(asText(error?.message, `${mode} runner failed.`));
    heart.finalize();
    if (page) {
      const failureScreenshot = await captureArtifact(page, env, `${mode}-failure-state`).catch(() => "");
      if (failureScreenshot) {
        heart.addArtifact({ label: `${mode} failure screenshot`, kind: "screenshot", path: failureScreenshot });
      }
    }
    await postHeartIncident(env, {
      runId: env.runId,
      source: mode,
      module: mode,
      severity: "critical",
      title: `${mode} runner failed`,
      message: asText(error?.stack || error?.message, `${mode} runner failed.`),
      status: "open",
      environment: "production",
      build: env.githubSha,
      actor: env.ceoEmail
    }).catch(() => undefined);
    await emitStatus("Run failed", "failed", asText(error?.message, `${mode} runner failed.`)).catch(() => undefined);
  } finally {
    if (browserContext) {
      const tracePath = path.resolve(env.artifactDir, `${mode}-trace.zip`);
      await browserContext.tracing.stop({ path: tracePath }).catch(() => undefined);
      heart.addArtifact({ label: `${mode} trace`, kind: "trace", path: tracePath });
    }
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    const report = heart.getReport();
    const reportPath = await writeHeartReport({ report, outputFile: env.outputFile });
    heart.addArtifact({ label: `${mode} report`, kind: "json", path: reportPath });
    await postHeartReport(env, {
      runId: env.runId,
      report: heart.getReport()
    }).catch(() => undefined);
  }

  const finalStatus = heart.getReport().status;
  process.exit(finalStatus === "failed" || finalStatus === "critical" ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
