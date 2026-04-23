import { runBusinessMutationChecks } from "../actions/business-actions.mjs";
import { runChatChecks } from "../actions/chat-actions.mjs";
import { runCartAndOrderChecks } from "../actions/commerce-actions.mjs";
import { runCrmChecks } from "../actions/crm-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runUserSocialMutationChecks } from "../actions/social-actions.mjs";

export async function runMutationPack({ page, env, heart, personas, emitStatus = async () => {}, createScopedPage = null } = {}) {
  async function withPage(label, runner) {
    if (createScopedPage) {
      const scope = await createScopedPage(label);
      try {
        await runner(scope.page);
      } finally {
        await scope.dispose();
      }
      return;
    }
    await runner(page);
  }

  await emitStatus("Schreibtest / Nutzer", "running", "Heart prueft geschuetzte Nutzer-Schreibpfade.");
  await withPage("mutation-user", async (activePage) => {
    const userAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.user, moduleKey: "auth" });
    if (userAuth.ok) {
      await runUserSocialMutationChecks({ page: activePage, env, heart, persona: personas.user });
      await runCartAndOrderChecks({ page: activePage, env, heart, persona: personas.user });
      await runChatChecks({ page: activePage, env, heart, persona: personas.user });
    }
  });

  await emitStatus("Schreibtest / Business", "running", "Heart prueft geschuetzte Business-Schreibpfade.");
  await withPage("mutation-business", async (activePage) => {
    const businessAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.business, moduleKey: "auth" });
    if (businessAuth.ok) {
      await runBusinessMutationChecks({ page: activePage, env, heart, persona: personas.business });
    }
  });

  await emitStatus("Schreibtest / CRM", "running", "Heart prueft geschuetzte CRM-Schreibpfade.");
  await withPage("mutation-ceo", async (activePage) => {
    const ceoAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.ceo, moduleKey: "auth" });
    if (ceoAuth.ok) {
      await runCrmChecks({ page: activePage, env, heart, persona: personas.ceo });
    }
  });

  heart.setSummary("Schreibtest beendet. Jeder Schreibpfad wurde entweder sicher ausgefuehrt, bewusst geschuetzt oder als nicht eingerichtet markiert.");
}
