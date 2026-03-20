import {
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  waitForText
} from "../helpers/social-app.mjs";
import {
  createCleanupItem,
  hasRequiredConfig,
  markGuarded,
  markNotConfigured,
  replaceRunTokens
} from "./common-actions.mjs";

function mutationReady(env) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

export async function runCrmChecks({ page, env, heart, persona } = {}) {
  const crm = env.packConfig?.actions?.crm || {};
  const leadCreate = crm.leadCreate || {};
  const leadEdit = crm.leadEdit || {};

  if (!leadCreate.url) {
    heart.notConfiguredModule("crm", "CRM lead URL is not configured.", {
      action: "lead open",
      persona: persona.key,
      area: "crm"
    });
    return;
  }

  await openPageAndWait(page, leadCreate.url, "body", heart, {
    title: `${persona.label} / Open CRM`,
    moduleKey: "crm",
    area: "crm",
    persona: persona.key
  });
  heart.passModule("crm", "CRM surface opened.", {
    action: "crm open",
    persona: persona.key,
    area: "crm"
  });

  if (!mutationReady(env)) {
    markGuarded(heart, "crm", "CRM mutation checks are guarded until isolated mutation mode is enabled.", {
      action: "lead create",
      persona: persona.key,
      area: "crm"
    });
    return;
  }

  if (!hasRequiredConfig(leadCreate, ["url", "saveSelector"])) {
    markNotConfigured(heart, "crm", "CRM lead create selectors need setup.", {
      action: "lead create",
      persona: persona.key,
      area: "crm"
    });
    return;
  }

  const leadName = replaceRunTokens("TEST_RUN_<runId>_LEAD_1", env);
  await openPageAndWait(page, leadCreate.url, "body", heart, {
    title: `${persona.label} / Open lead create flow`,
    moduleKey: "crm",
    area: "crm",
    persona: persona.key
  });
  if (leadCreate.openSelector) {
    await clickIfPresent(page, leadCreate.openSelector);
  }
  if (leadCreate.nameSelector) {
    await fillIfPresent(page, leadCreate.nameSelector, leadName);
  }
  if (leadCreate.emailSelector) {
    await fillIfPresent(page, leadCreate.emailSelector, `${leadName.toLowerCase()}@mnyra-test.local`);
  }
  await clickIfPresent(page, leadCreate.saveSelector);
  if (leadCreate.verifyText) {
    await waitForText(page, replaceRunTokens(leadCreate.verifyText, env));
  }
  heart.addCreatedEntity({
    id: leadName,
    type: "lead",
    label: leadName,
    status: "success",
    summary: "Synthetic CRM lead created.",
    cleanupStatus: "pending",
    module: "crm",
    persona: persona.key
  });
  heart.passModule("crm", "Lead create action completed.", {
    action: "lead create",
    persona: persona.key,
    area: "crm"
  });

  if (hasRequiredConfig(leadEdit, ["url", "openSelector", "inputSelector", "saveSelector"])) {
    await openPageAndWait(page, leadEdit.url, "body", heart, {
      title: `${persona.label} / Open lead edit flow`,
      moduleKey: "crm",
      area: "crm",
      persona: persona.key
    });
    await clickIfPresent(page, leadEdit.openSelector);
    await fillIfPresent(page, leadEdit.inputSelector, replaceRunTokens("TEST_RUN_<runId>_LEAD_EDIT", env));
    await clickIfPresent(page, leadEdit.saveSelector);
    if (leadEdit.verifyText) {
      await waitForText(page, replaceRunTokens(leadEdit.verifyText, env));
    }
    heart.passModule("crm", "Lead edit action completed.", {
      action: "lead edit",
      persona: persona.key,
      area: "crm"
    });
  } else {
    heart.notConfiguredModule("crm", "Lead edit selectors are not configured.", {
      action: "lead edit",
      persona: persona.key,
      area: "crm"
    });
  }

  const cleanupItems = [];
  heart.notConfiguredModule("crm", "Lead delete automation still needs explicit delete selectors and safe cleanup rules.", {
    action: "lead delete",
    persona: persona.key,
    area: "crm"
  });
  heart.notConfiguredModule("crm", "Lead convert automation still needs explicit conversion selectors.", {
    action: "lead convert",
    persona: persona.key,
    area: "crm"
  });
  heart.notConfiguredModule("crm", "Customer create/edit automation still needs explicit selectors.", {
    action: "customer create/edit",
    persona: persona.key,
    area: "crm"
  });
  if (leadCreate.deleteSelector && leadCreate.confirmDeleteSelector) {
    cleanupItems.push(createCleanupItem("CRM lead cleanup", "pending", "Delete selectors are configured for future cleanup automation."));
  }
  heart.setCleanup(
    cleanupItems.length ? "warning" : "warning",
    cleanupItems.length
      ? "Synthetic CRM data was created. Cleanup selectors exist but live deletion is not yet executed automatically in this baseline."
      : "Synthetic CRM data was created. Cleanup still needs explicit delete selectors.",
    cleanupItems
  );
}
