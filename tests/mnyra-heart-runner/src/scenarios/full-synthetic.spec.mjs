import {
  captureArtifact,
  loginAsCeo,
  openTab,
  writeTextArtifact
} from "../helpers/social-app.mjs";
import {
  createSyntheticEntitySet
} from "../utils/synthetic-data.mjs";
import {
  SOCIAL_TABS
} from "../utils/selectors.mjs";

export async function runSyntheticScenario({ page, env, heart, emitStatus = async () => {} }) {
  await loginAsCeo(page, env, heart);
  await emitStatus("Auth verified", "running", "CEO login completed for full synthetic pack.");

  const synthetic = createSyntheticEntitySet(env.syntheticPrefix);
  heart.addTimeline("Synthetic / Prepare isolation set", "running", `Using synthetic prefix ${env.syntheticPrefix}`);
  await emitStatus("Synthetic isolation prepared", "running", `Synthetic prefix ${env.syntheticPrefix} prepared.`);

  await openTab(page, env, SOCIAL_TABS.feed, heart, {
    moduleKey: "feed",
    note: "Feed surface opened before broader synthetic checks."
  });
  await emitStatus("Feed verified", "running", "Feed surface loaded.");
  await openTab(page, env, SOCIAL_TABS.profile, heart, {
    moduleKey: "profile",
    note: "Profile surface opened before broader synthetic checks."
  });
  await emitStatus("Profile verified", "running", "Profile surface loaded.");
  await openTab(page, env, SOCIAL_TABS.menu, heart, {
    moduleKey: "menu",
    note: "Menu surface opened before broader synthetic checks."
  });
  await emitStatus("Menu verified", "running", "Menu surface loaded.");
  await openTab(page, env, SOCIAL_TABS.chat, heart, {
    moduleKey: "chat",
    note: "Chat surface opened before broader synthetic checks."
  });
  await emitStatus("Chat verified", "running", "Chat surface loaded.");
  await openTab(page, env, SOCIAL_TABS.orders, heart, {
    moduleKey: "orders",
    note: "Orders surface opened before broader synthetic checks."
  });
  await emitStatus("Orders verified", "running", "Orders surface loaded.");
  await openTab(page, env, SOCIAL_TABS.leads, heart, {
    moduleKey: "crm",
    note: "CRM surface opened before broader synthetic checks."
  });
  await emitStatus("CRM verified", "running", "CRM surface loaded.");

  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    heart.warnModule("business", "Full synthetic live mutations are disabled until MNYRA_ALLOW_LIVE_MUTATIONS=true and MNYRA_SYNTHETIC_ISOLATION_KEY are both configured.");
    heart.warnModule("cart", "Synthetic cart flow skipped without isolated mutation mode.");
    heart.setCleanup("idle", "No cleanup was required because no live synthetic entities were created.", []);
    const notesPath = await writeTextArtifact(env, "synthetic-notes.txt", [
      `syntheticPrefix=${env.syntheticPrefix}`,
      `allowLiveMutations=${env.allowLiveMutations}`,
      `syntheticIsolationKey=${env.syntheticIsolationKey ? "present" : "missing"}`
    ].join("\n"));
    heart.addArtifact({ label: "Synthetic guardrail notes", kind: "text", path: notesPath });
    heart.setSummary("Full synthetic architecture executed in safe read-only mode. Enable isolated mutation env values to exercise write flows.");
    await emitStatus("Synthetic run completed with guardrails", "warning", "Synthetic mutation mode remained read-only.");
    return;
  }

  heart.addCreatedEntity({
    id: synthetic.crmLeadName,
    type: "synthetic-plan",
    label: synthetic.crmLeadName,
    status: "success",
    summary: "Synthetic isolation key accepted; broader mutation plan enabled.",
    cleanupStatus: "queued"
  });
  heart.passModule("business", "Synthetic isolation guard satisfied. Deeper business-scope actions may run on this target.");
  heart.passModule("cart", "Synthetic mutation mode enabled. Configure per-surface selectors to execute live isolated actions.");
  await emitStatus("Synthetic mutation mode enabled", "running", "Isolated mutation guard passed.");
  heart.setCleanup("warning", "Mutation mode was enabled, but no selector-specific live actions were configured in this baseline pack.", []);
  const screenshotPath = await captureArtifact(page, env, "synthetic-final-state");
  heart.addArtifact({ label: "Synthetic final screenshot", kind: "screenshot", path: screenshotPath });
  heart.setSummary("Full synthetic control path booted with isolated mutation mode. Add per-surface selectors to execute deeper write scenarios without changing the Heart UI or backend contracts.");
  await emitStatus("Synthetic run completed", "warning", "Synthetic pack completed without selector-specific live actions.");
}
