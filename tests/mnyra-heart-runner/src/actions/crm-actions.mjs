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
    heart.notConfiguredModule("crm", "CRM-Lead-URL fehlt.", {
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
  heart.passModule("crm", "CRM wurde geoeffnet.", {
    action: "crm open",
    persona: persona.key,
    area: "crm"
  });

  if (!mutationReady(env)) {
    markGuarded(heart, "crm", "CRM-Schreibtests sind im Moment geschuetzt. Aktiviere erst den isolierten Schreibmodus.", {
      action: "lead create",
      persona: persona.key,
      area: "crm"
    });
    return;
  }

  if (!hasRequiredConfig(leadCreate, ["url", "saveSelector"])) {
    markNotConfigured(heart, "crm", "Fuer das Erstellen eines Leads fehlen noch Selektoren.", {
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
    summary: "Test-Lead wurde erstellt.",
    cleanupStatus: "pending",
    module: "crm",
    persona: persona.key
  });
  heart.passModule("crm", "Lead wurde erstellt.", {
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
    heart.passModule("crm", "Lead wurde bearbeitet.", {
      action: "lead edit",
      persona: persona.key,
      area: "crm"
    });
  } else {
    heart.notConfiguredModule("crm", "Selektoren fuer Lead-Bearbeitung fehlen.", {
      action: "lead edit",
      persona: persona.key,
      area: "crm"
    });
  }

  const cleanupItems = [];
  heart.notConfiguredModule("crm", "Lead-Loeschung braucht noch sichere Loesch-Selektoren.", {
    action: "lead delete",
    persona: persona.key,
    area: "crm"
  });
  heart.notConfiguredModule("crm", "Lead-Umwandlung braucht noch eigene Selektoren.", {
    action: "lead convert",
    persona: persona.key,
    area: "crm"
  });
  heart.notConfiguredModule("crm", "Kunden-Erstellung und -Bearbeitung brauchen noch eigene Selektoren.", {
    action: "customer create/edit",
    persona: persona.key,
    area: "crm"
  });
  if (leadCreate.deleteSelector && leadCreate.confirmDeleteSelector) {
    cleanupItems.push(createCleanupItem("CRM-Lead aufraeumen", "pending", "Loesch-Selektoren sind vorbereitet, aber noch nicht live aktiviert."));
  }
  heart.setCleanup(
    cleanupItems.length ? "warning" : "warning",
    cleanupItems.length
      ? "Heart hat CRM-Testdaten erstellt. Die Loesch-Selektoren sind vorbereitet, aber das automatische Entfernen laeuft noch nicht live."
      : "Heart hat CRM-Testdaten erstellt. Fuer automatisches Aufraeumen fehlen noch Loesch-Selektoren.",
    cleanupItems
  );
}
