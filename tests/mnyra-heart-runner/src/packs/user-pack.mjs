import { runChatChecks } from "../actions/chat-actions.mjs";
import { runCartAndOrderChecks } from "../actions/commerce-actions.mjs";
import { runDiscoveryChecks } from "../actions/discovery-actions.mjs";
import { acceptPendingFollowRequestsInScopedSession } from "../actions/follow-request-actions.mjs";
import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks, runUserSocialMutationChecks } from "../actions/social-actions.mjs";

export async function runUserPack({
  page,
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage
} = {}) {
  const user = personas.user;
  const auth = await ensurePersonaSession({ page, heart, persona: user, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Nutzer-Test konnte nicht starten, weil die Nutzer-Zugangsdaten fehlen.");
    return;
  }

  await emitStatus("Nutzer / Oberflaechen", "running", "Heart prueft die Nutzer-Oberflaechen.");
  await runSocialSurfaceChecks({ page, env, heart, persona: user });
  await runUserSocialMutationChecks({
    page,
    env,
    heart,
    persona: user,
    includeLikeAction: false
  });
  await acceptPendingFollowRequestsInScopedSession({
    createScopedPage,
    heart,
    approverPersona: personas.business,
    requesterPersona: user
  });
  await runCartAndOrderChecks({ page, env, heart, persona: user });
  await runChatChecks({ page, env, heart, persona: user });
  await runDiscoveryChecks({ page, env, heart, persona: user });
  await runJourneyChecks({ page, env, heart, persona: user });
  await runPwaChecks({ page, heart, persona: user });
  heart.setSummary("User-Volltest beendet. Feed, Profil, Screenshot-Posts, Kommentare, Folgen, Chat, Karte, Suche und Bestellung wurden geprueft.");
}
