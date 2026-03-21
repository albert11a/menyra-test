import {
  clickIfPresent,
  ensureElementVisible,
  fillIfPresent,
  openPageAndWait,
  waitForAnySelector,
  waitForSelectorToDisappear
} from "../helpers/social-app.mjs";
import {
  createCleanupItem,
  hasRequiredConfig,
  markGuarded,
  markSkipped,
  markNotConfigured,
  replaceRunTokens
} from "./common-actions.mjs";

function mutationReady(env) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

function toSelectorList(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function openLeadEditor(page, {
  openSelector = "",
  nameSelector = "",
  saveSelector = "",
  actionLabel = "Lead-Editor"
} = {}) {
  if (!openSelector) return;
  const opened = await clickIfPresent(page, openSelector, 12000);
  if (!opened) {
    throw new Error(`${actionLabel} konnte nicht geoeffnet werden. Heart hat keinen passenden Startbutton gefunden.`);
  }
  const editorSelectors = [
    ...toSelectorList(nameSelector),
    ...toSelectorList(saveSelector),
    "#leadCreateView",
    "#leadModalClose"
  ];
  const editorVisible = await waitForAnySelector(page, editorSelectors, 20000).catch(() => false);
  if (!editorVisible) {
    throw new Error(`${actionLabel} wurde gestartet, aber der Editor ist nicht sichtbar geworden.`);
  }
}

async function waitForLeadFlowToComplete(page, inputSelector = "") {
  const checks = [
    waitForSelectorToDisappear(page, "#leadModalClose", 20000).catch(() => false),
    waitForSelectorToDisappear(page, inputSelector || "#leadBusinessName", 20000).catch(() => false),
    page.locator("[data-lead-edit], #newLeadBtn").first().waitFor({ state: "visible", timeout: 20000 }).then(() => true).catch(() => false)
  ];
  const results = await Promise.all(checks);
  return results.some(Boolean);
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

  try {
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
  } catch (error) {
    heart.failModule("crm", error, {
      action: "crm open",
      title: "CRM konnte nicht geoeffnet werden",
      persona: persona.key,
      area: "crm"
    });
    return;
  }

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
  try {
    await openPageAndWait(page, leadCreate.url, "body", heart, {
      title: `${persona.label} / Open lead create flow`,
      moduleKey: "crm",
      area: "crm",
      persona: persona.key
    });
    await openLeadEditor(page, {
      openSelector: leadCreate.openSelector,
      nameSelector: leadCreate.nameSelector,
      saveSelector: leadCreate.saveSelector,
      actionLabel: "Lead-Erstellung"
    });
    if (leadCreate.nameSelector) {
      await fillIfPresent(page, leadCreate.nameSelector, leadName);
    }
    if (leadCreate.emailSelector) {
      await fillIfPresent(page, leadCreate.emailSelector, `${leadName.toLowerCase()}@mnyra-test.local`);
    }
    await ensureElementVisible(page, leadCreate.saveSelector, 15000);
    await clickIfPresent(page, leadCreate.saveSelector);
    const flowCompleted = await waitForLeadFlowToComplete(page, leadCreate.nameSelector || "#leadBusinessName");
    if (!flowCompleted) {
      throw new Error("Heart konnte nach dem Speichern keinen abgeschlossenen Lead-Flow bestaetigen.");
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
  } catch (error) {
    heart.failModule("crm", error, {
      action: "lead create",
      title: "Lead konnte nicht erstellt werden",
      persona: persona.key,
      area: "crm"
    });
  }

  if (hasRequiredConfig(leadEdit, ["url", "openSelector", "inputSelector", "saveSelector"])) {
    try {
      await openPageAndWait(page, leadEdit.url, "body", heart, {
        title: `${persona.label} / Open lead edit flow`,
        moduleKey: "crm",
        area: "crm",
        persona: persona.key
      });
      await openLeadEditor(page, {
        openSelector: leadEdit.openSelector,
        nameSelector: leadEdit.inputSelector,
        saveSelector: leadEdit.saveSelector,
        actionLabel: "Lead-Bearbeitung"
      });
      const editedLeadName = replaceRunTokens("TEST_RUN_<runId>_LEAD_EDIT", env);
      await fillIfPresent(page, leadEdit.inputSelector, editedLeadName);
      await ensureElementVisible(page, leadEdit.saveSelector, 15000);
      await clickIfPresent(page, leadEdit.saveSelector);
      const flowCompleted = await waitForLeadFlowToComplete(page, leadEdit.inputSelector || "#leadBusinessName");
      if (!flowCompleted) {
        throw new Error("Heart konnte nach dem Speichern keinen abgeschlossenen Lead-Bearbeitungsflow bestaetigen.");
      }
      heart.passModule("crm", "Lead wurde bearbeitet.", {
        action: "lead edit",
        persona: persona.key,
        area: "crm"
      });
    } catch (error) {
      heart.failModule("crm", error, {
        action: "lead edit",
        title: "Lead konnte nicht bearbeitet werden",
        persona: persona.key,
        area: "crm"
      });
    }
  } else {
    heart.notConfiguredModule("crm", "Selektoren fuer Lead-Bearbeitung fehlen.", {
      action: "lead edit",
      persona: persona.key,
      area: "crm"
    });
  }

  const cleanupItems = [];
  markSkipped(heart, "crm", "Lead-Loeschung wird im Heart-Runner noch nicht automatisch gefahren.", {
    action: "lead delete",
    persona: persona.key,
    area: "crm"
  });
  markSkipped(heart, "crm", "Lead-Umwandlung wird im Heart-Runner noch nicht separat gefahren.", {
    action: "lead convert",
    persona: persona.key,
    area: "crm"
  });
  markSkipped(heart, "crm", "Kunden-Erstellung und -Bearbeitung werden im Heart-Runner noch nicht separat gefahren.", {
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
