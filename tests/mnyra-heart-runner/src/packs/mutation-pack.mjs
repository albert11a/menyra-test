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

  await emitStatus("Mutation / User", "running", "Running guarded user mutation checks.");
  await withPage("mutation-user", async (activePage) => {
    const userAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.user, moduleKey: "auth" });
    if (userAuth.ok) {
      await runUserSocialMutationChecks({ page: activePage, env, heart, persona: personas.user });
      await runCartAndOrderChecks({ page: activePage, env, heart, persona: personas.user });
      await runChatChecks({ page: activePage, env, heart, persona: personas.user });
    }
  });

  await emitStatus("Mutation / Business", "running", "Running guarded business mutation checks.");
  await withPage("mutation-business", async (activePage) => {
    const businessAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.business, moduleKey: "auth" });
    if (businessAuth.ok) {
      await runBusinessMutationChecks({ page: activePage, env, heart, persona: personas.business });
    }
  });

  await emitStatus("Mutation / CRM", "running", "Running guarded CRM mutations.");
  await withPage("mutation-ceo", async (activePage) => {
    const ceoAuth = await ensurePersonaSession({ page: activePage, heart, persona: personas.ceo, moduleKey: "auth" });
    if (ceoAuth.ok) {
      await runCrmChecks({ page: activePage, env, heart, persona: personas.ceo });
    }
  });

  heart.setSummary("Mutation pack completed. Every write path was either executed safely, guarded, or marked as not configured.");
}
