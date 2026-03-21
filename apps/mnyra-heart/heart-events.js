function findActionTarget(target) {
  return target?.closest?.("[data-action], [data-nav-key], [data-run-id]") || null;
}

export function bindHeartEvents({
  root,
  operations
} = {}) {
  if (!root || !operations) {
    return () => {};
  }

  async function handleClick(event) {
    const target = findActionTarget(event.target);
    if (!target) return;

    if (target.hasAttribute("data-nav-key")) {
      event.preventDefault();
      operations.openView?.(target.getAttribute("data-nav-key"));
      return;
    }

    const action = String(target.getAttribute("data-action") || "").trim();
    if (!action) return;
    event.preventDefault();

    if (action === "toggle-nav") {
      operations.toggleNav?.();
      return;
    }
    if (action === "toggle-quick-actions") {
      operations.toggleQuickActions?.();
      return;
    }
    if (action === "toggle-run-launcher") {
      operations.toggleRunLauncher?.();
      return;
    }
    if (action === "open-run-guide") {
      operations.openRunGuide?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "start-pack-from-guide") {
      await operations.startPackFromGuide?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "open-run-detail") {
      await operations.openRunDetail?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "toggle-run-detail-more") {
      operations.toggleRunDetailMore?.();
      return;
    }
    if (action === "delete-run-artifact") {
      await operations.deleteRunArtifact?.(
        target.getAttribute("data-run-id"),
        target.getAttribute("data-artifact-id")
      );
      return;
    }
    if (action === "delete-run-artifacts") {
      await operations.deleteRunArtifacts?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "set-runs-history-tab") {
      operations.setRunsHistoryTab?.(target.getAttribute("data-history-tab"));
      return;
    }
    if (action === "toggle-runs-history-edit") {
      operations.toggleRunsHistoryEdit?.();
      return;
    }
    if (action === "toggle-runs-history-selection") {
      operations.toggleRunsHistorySelection?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "update-run-archive") {
      await operations.updateRunArchive?.(target.getAttribute("data-archive-state"));
      return;
    }
    if (action === "select-setup-restaurant") {
      await operations.selectSetupRestaurant?.({
        restaurantId: target.getAttribute("data-restaurant-id"),
        restaurantName: target.getAttribute("data-restaurant-name"),
        restaurantHandle: target.getAttribute("data-restaurant-handle"),
        guestRouteUrl: target.getAttribute("data-guest-route-url")
      });
      return;
    }
    if (action === "provision-setup-personas") {
      await operations.provisionSetupPersonas?.(target.getAttribute("data-personas"));
      return;
    }
    if (action === "delete-setup-persona") {
      await operations.deleteSetupPersona?.(target.getAttribute("data-persona-key"));
      return;
    }
    if (action === "close-modal") {
      operations.closeModal?.();
      return;
    }
    if (action === "refresh-heart") {
      await operations.refresh?.();
      return;
    }
    if (action === "delete-incident") {
      await operations.deleteIncident?.(target.getAttribute("data-incident-id"));
      return;
    }
    if (action === "start-smoke") {
      await operations.startSmoke?.();
      return;
    }
    if (action === "start-synthetic") {
      await operations.startSynthetic?.();
      return;
    }
    if (action === "start-pack") {
      await operations.startPack?.(target.getAttribute("data-pack-key"));
      return;
    }
    if (action === "logout") {
      await operations.logout?.();
      return;
    }
    if (action === "open-run") {
      await operations.openRun?.(target.getAttribute("data-run-id"));
      return;
    }
    if (action === "cancel-run") {
      await operations.cancelRun?.(target.getAttribute("data-run-id"));
    }
  }

  async function handleSubmit(event) {
    const form = event.target?.closest?.("[data-heart-login]");
    if (form) {
      event.preventDefault();
      const formData = new FormData(form);
      await operations.login?.({
        email: formData.get("email"),
        password: formData.get("password")
      });
      return;
    }

    const searchForm = event.target?.closest?.("[data-heart-setup-search]");
    if (searchForm) {
      event.preventDefault();
      const formData = new FormData(searchForm);
      await operations.searchSetupRestaurants?.(formData.get("query"));
      return;
    }

    const setupForm = event.target?.closest?.("[data-heart-setup-save]");
    if (setupForm) {
      event.preventDefault();
      const formData = new FormData(setupForm);
      await operations.saveSetup?.({
        restaurantId: formData.get("restaurantId"),
        restaurantName: formData.get("restaurantName"),
        guestRouteUrl: formData.get("guestRouteUrl"),
        allowLiveMutations: formData.get("allowLiveMutations") === "on"
      });
    }
  }

  function handleChange(event) {
    const select = event.target?.closest?.("[data-incident-filter]");
    if (!select) return;
    operations.setIncidentFilter?.(select.getAttribute("data-incident-filter"), select.value);
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("submit", handleSubmit);
  root.addEventListener("change", handleChange);

  return () => {
    root.removeEventListener("click", handleClick);
    root.removeEventListener("submit", handleSubmit);
    root.removeEventListener("change", handleChange);
  };
}
