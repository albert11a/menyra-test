import { createPublicBootstrapRuntimeController } from "./public-bootstrap-runtime-controller.js";
import { preparePublicBootstrapStartup } from "./public-bootstrap-startup-utils.js";
import { createPostLoginRouteOpenCoordinator } from "../auth/auth-post-login-route-open-utils.js";
import { createAuthSessionStartupCoordinator } from "../auth/auth-session-startup-coordinator.js";

export function startAppStartupBootstrap({
  publicBootstrapDeps = {},
  startupPrepDeps = {},
  routeOpenDeps = {},
  authStartupDeps = {}
} = {}) {
  const {
    applyPublicBootstrapPayload,
    fetchPublicBootstrapPayload,
    bindPublicBootstrapPayloadListener
  } = createPublicBootstrapRuntimeController(publicBootstrapDeps);

  const {
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  } = preparePublicBootstrapStartup({
    ...startupPrepDeps,
    bindPublicBootstrapPayloadListener,
    applyPublicBootstrapPayload
  });

  const postLoginRouteOpenCoordinator = createPostLoginRouteOpenCoordinator(routeOpenDeps);
  const authSessionStartupCoordinator = createAuthSessionStartupCoordinator({
    ...authStartupDeps,
    fetchPublicBootstrapPayload,
    postLoginRouteOpenCoordinator
  });

  authSessionStartupCoordinator.start({
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  });

  return {
    authSessionStartupCoordinator
  };
}
