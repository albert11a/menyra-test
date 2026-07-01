module.exports = {
  forbidden: [
    {
      name: "baseline-no-circular",
      severity: "warn",
      comment:
        "Circular dependencies are reported as refactor baseline, not blocked yet.",
      from: {},
      to: { circular: true },
    },
    {
      name: "public-runtime-must-not-import-heart",
      severity: "warn",
      from: { path: "^apps/menyra-social" },
      to: { path: "^apps/mnyra-heart" },
    },
    {
      name: "waiter-must-not-import-social-app",
      severity: "warn",
      from: { path: "^apps/waiter" },
      to: { path: "^apps/menyra-social/social-app\\.js$" },
    },
    {
      name: "shared-must-not-import-apps",
      severity: "warn",
      from: { path: "^shared" },
      to: { path: "^apps/" },
    },
    {
      name: "functions-must-not-import-browser-apps",
      severity: "warn",
      from: { path: "^functions" },
      to: { path: "^apps/" },
    },
  ],
  options: {
    combinedDependencies: true,
    doNotFollow: {
      path: "node_modules|apps/menyra-social/bundled|dist|tmp|seed/export|tests/mnyra-heart-runner/node_modules",
    },
    exclude: {
      path: "node_modules|apps/menyra-social/bundled|dist|tmp|seed/export|tests/mnyra-heart-runner/node_modules",
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
    },
  },
};
