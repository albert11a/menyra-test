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
      await emitStatus("Journey / CEO", "running", "Heart prueft CEO-Journeys.");
      await runJourneyChecks({ page: activePage, env, heart, persona: ceo });
      await runPwaChecks({ page: activePage, heart, persona: ceo });
    }
  } finally {
    if (ceoScope) {
      await ceoScope.dispose();
    }
  }

  await emitStatus("Journey / Gast", "running", "Heart prueft Gast-Journeys.");
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
  heart.setSummary("Journey-Test beendet. Navigation, wiederholte Interaktionen und Gast-Wege wurden dort geprueft, wo eine Einrichtung vorhanden ist.");
}
