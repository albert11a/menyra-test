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
    if (action === "refresh-heart") {
      await operations.refresh?.();
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
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    await operations.login?.({
      email: formData.get("email"),
      password: formData.get("password")
    });
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
