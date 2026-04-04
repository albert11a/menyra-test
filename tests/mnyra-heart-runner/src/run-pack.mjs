import path from "node:path";
import { chromium } from "playwright";
import config from "../playwright.config.js";
import { getRunnerEnv } from "./helpers/env.mjs";
import { createHeartContext } from "./helpers/heart-context.mjs";
import { captureArtifact, writeTextArtifact } from "./helpers/social-app.mjs";
import { createRuntimeMonitor } from "./helpers/runtime-monitor.mjs";
import { createPersonaRegistry } from "./personas/persona-registry.mjs";
import { resolvePackRunner } from "./packs/pack-registry.mjs";
import { writeHeartReport } from "./reporters/heart-json-reporter.mjs";
import {
  postHeartIncident,
  postHeartReport,
  postHeartStatus,
  uploadHeartArtifact
} from "./reporters/heart-webhook-client.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toSafeFileName(value, fallback = "artifact") {
  const text = asText(value, fallback).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return text || fallback;
}

const EXPLICIT_MUTATION_PACKS = new Set([
  "mutation-pack"
]);

function buildRunSnapshotPayload(report = {}) {
  return {
    mode: report.mode,
    packKey: report.packKey,
    packLabel: report.packLabel,
    packLevel: report.packLevel,
    packSummary: report.packSummary,
    personas: Array.isArray(report.personas) ? report.personas : [],
    status: report.status,
    summary: report.summary,
    currentStep: report.currentStep,
    startedAt: report.startedAt,
    endedAt: report.endedAt,
    durationMs: report.durationMs,
    branch: report.branch,
    build: report.build,
    passedChecks: report.passedChecks,
    failedChecks: report.failedChecks,
    warningCount: report.warningCount,
    statusBreakdown: report.statusBreakdown,
    modules: report.modules,
    timeline: report.timeline,
    createdEntities: report.createdEntities,
    cleanup: report.cleanup,
    artifacts: report.artifacts,
    failureDetails: report.failureDetails,
    runFlags: report.runFlags,
    github: report.github
  };
}

async function main() {
  const requestedPackKey = asText(process.argv[2], process.env.HEART_PACK_KEY || "smoke");
  let env = await getRunnerEnv(requestedPackKey);
  const {
    pack,
    runPack
  } = resolvePackRunner(requestedPackKey);
  const liveMutationsAllowedForPack = EXPLICIT_MUTATION_PACKS.has(pack.key) && !!env.allowLiveMutations;
  env = {
    ...env,
    allowLiveMutations: liveMutationsAllowedForPack
  };
  const personas = createPersonaRegistry(env);

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

  async function recordArtifact(label, kind, filePath) {
    const safePath = asText(filePath);
    if (!safePath) return;
    try {
      const uploaded = await uploadHeartArtifact(env, {
        runId: env.runId,
        label,
        kind,
        filePath: safePath
      });
      if (uploaded) {
        heart.addArtifact(uploaded);
        return;
      }
    } catch {}
    heart.addArtifact({ label, kind, path: safePath });
  }

  async function flushRuntimeDiagnostics(monitor, label = "runtime") {
    if (!monitor) return;
    const diagnostics = await monitor.flush().catch(() => null);
    if (!diagnostics) return;
    const fileName = `${toSafeFileName(label, "runtime")}-runtime-diagnostics.json`;
    const filePath = await writeTextArtifact(env, fileName, `${JSON.stringify(diagnostics, null, 2)}\n`).catch(() => "");
    if (filePath) {
      await recordArtifact(`${label} Laufdiagnose`, "json", filePath);
    }
  }

  let browser;
  let browserContext;
  let page;
  let rootRuntimeMonitor;

  async function createScopedPage(label = "scope") {
    const scopedContext = await browser.newContext({ viewport: config.viewport });
    scopedContext.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    scopedContext.setDefaultTimeout(config.actionTimeoutMs);
    await scopedContext.tracing.start({
      screenshots: !!config.traceScreenshots,
      snapshots: !!config.traceSnapshots
    });
    const scopedPage = await scopedContext.newPage();
    const scopedRuntimeMonitor = createRuntimeMonitor({
      page: scopedPage,
      heart,
      env,
      scopeLabel: label
    });
    return {
      page: scopedPage,
      async dispose() {
        const proofPath = await captureArtifact(scopedPage, env, `${label}-proof`).catch(() => "");
        if (proofPath) {
          await recordArtifact(`${label} Beweisbild`, "screenshot", proofPath);
        }
        const tracePath = path.resolve(env.artifactDir, `${label}-trace.zip`);
        await scopedContext.tracing.stop({ path: tracePath }).catch(() => undefined);
        await recordArtifact(`${label} Ablaufspur`, "trace", tracePath);
        await flushRuntimeDiagnostics(scopedRuntimeMonitor, label);
        await scopedContext.close().catch(() => undefined);
      }
    };
  }

  try {
    heart.setSummary(`${pack.title} startet.`);
    await emitStatus("Runner startet", "running", `${pack.title} wird vorbereitet.`);

    browser = await chromium.launch({ headless: env.headless });
    browserContext = await browser.newContext({ viewport: config.viewport });
    browserContext.setDefaultNavigationTimeout(config.navigationTimeoutMs);
    browserContext.setDefaultTimeout(config.actionTimeoutMs);
    await browserContext.tracing.start({
      screenshots: !!config.traceScreenshots,
      snapshots: !!config.traceSnapshots
    });
    page = await browserContext.newPage();
    rootRuntimeMonitor = createRuntimeMonitor({
      page,
      heart,
      env,
      scopeLabel: pack.key
    });

    await emitStatus(`${pack.title} laeuft`, "running", pack.summary);
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
      heart.report.status === "success" ? "Lauf beendet" : "Lauf beendet mit Hinweisen",
      heart.report.status,
      heart.report.summary
    );
    await postHeartStatus(env, {
      runId: env.runId,
      ...buildRunSnapshotPayload(heart.getReport())
    }).catch(() => undefined);
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
        await recordArtifact(`${pack.title} Fehlerbild`, "screenshot", failureScreenshot);
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
    await emitStatus("Lauf fehlgeschlagen", "failed", asText(error?.message, `${pack.title} ist fehlgeschlagen.`)).catch(() => undefined);
    await postHeartStatus(env, {
      runId: env.runId,
      ...buildRunSnapshotPayload(heart.getReport())
    }).catch(() => undefined);
  } finally {
    if (page) {
      const finalScreenshot = await captureArtifact(page, env, `${pack.key}-final-state`).catch(() => "");
      if (finalScreenshot) {
        await recordArtifact(`${pack.title} Beweisbild`, "screenshot", finalScreenshot);
      }
      await flushRuntimeDiagnostics(rootRuntimeMonitor, pack.key);
    }
    if (browserContext) {
      const tracePath = path.resolve(env.artifactDir, `${pack.key}-trace.zip`);
      await browserContext.tracing.stop({ path: tracePath }).catch(() => undefined);
      await recordArtifact(`${pack.title} Ablaufspur`, "trace", tracePath);
    }
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    const report = heart.getReport();
    const reportPath = await writeHeartReport({ report, outputFile: env.outputFile });
    await recordArtifact(`${pack.title} Bericht`, "json", reportPath);
    await postHeartStatus(env, {
      runId: env.runId,
      ...buildRunSnapshotPayload(heart.getReport())
    }).catch(() => undefined);
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
