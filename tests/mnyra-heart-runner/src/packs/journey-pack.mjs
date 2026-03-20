import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runGuestChecks } from "../actions/guest-actions.mjs";

export async function runJourneyPack({ page, env, heart, personas, emitStatus = async () => {}, createScopedPage = null } = {}) {
  const ceo = personas.ceo;
  let ceoScope = null;
  const activePage = createScopedPage ? (ceoScope = await createScopedPage("journey-ceo")).page : page;
  try {
    const auth = await ensurePersonaSession({ page: activePage, heart, persona: ceo, moduleKey: "auth" });
    if (auth.ok) {
      await emitStatus("Journey / CEO", "running", "Running CEO journey checks.");
      await runJourneyChecks({ page: activePage, env, heart, persona: ceo });
      await runPwaChecks({ page: activePage, heart, persona: ceo });
    }
  } finally {
    if (ceoScope) {
      await ceoScope.dispose();
    }
  }

  await emitStatus("Journey / Guest", "running", "Running guest journey checks.");
  if (createScopedPage) {
    const guestScope = await createScopedPage("journey-guest");
    try {
      await runGuestChecks({ page: guestScope.page, env, heart, persona: personas.guest });
    } finally {
      await guestScope.dispose();
    }
  } else {
    await runGuestChecks({ page, env, heart, persona: personas.guest });
  }
  heart.setSummary("Journey pack completed. Navigation, repeated interactions and guest movement paths were exercised where configured.");
}
