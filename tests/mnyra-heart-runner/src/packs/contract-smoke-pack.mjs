import {
  runGuestCheckoutContractSmoke,
  runLikesCommentsContractSmoke,
  runNotificationsContractSmoke
} from "../actions/contract-smoke-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";

export async function runContractSmokePack({
  page,
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage = null
} = {}) {
  async function withPage(label, runner) {
    if (typeof createScopedPage === "function") {
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

  await emitStatus("Contract / Likes Kommentare", "running", "Heart prueft Feed-Like, Kommentar und Firestore-Paritaet.");
  await withPage("contract-user-social", async (activePage) => {
    const auth = await ensurePersonaSession({
      page: activePage,
      heart,
      persona: personas.user,
      moduleKey: "auth"
    });
    if (auth.ok) {
      await runLikesCommentsContractSmoke({
        page: activePage,
        env,
        heart,
        persona: personas.user
      });
    }
  });

  await emitStatus("Contract / Notifications", "running", "Heart prueft Notification-Open-Target und Read-State.");
  await withPage("contract-business-notifications", async (activePage) => {
    const auth = await ensurePersonaSession({
      page: activePage,
      heart,
      persona: personas.business,
      moduleKey: "auth"
    });
    if (auth.ok) {
      await runNotificationsContractSmoke({
        page: activePage,
        env,
        heart,
        persona: personas.business
      });
    }
  });

  await emitStatus("Contract / Guest Checkout", "running", "Heart prueft QR-Warenkorb, Checkout und Restaurant-Order-Daten.");
  await withPage("contract-guest-checkout", async (activePage) => {
    await runGuestCheckoutContractSmoke({
      page: activePage,
      env,
      heart,
      persona: personas.guest
    });
  });

  heart.setSummary(
    "Contract-Smoke-Pack beendet. Likes / Kommentare, Notifications sowie Guest Cart / Checkout " +
    "wurden gegen die isolierte Testwelt mit ersten Firestore-Endzustandschecks gefahren."
  );
}
