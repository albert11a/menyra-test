module.exports = {
  fileExtensions: ["js", "mjs", "cjs"],
  excludeRegExp: [
    "node_modules",
    "apps/menyra-social/bundled",
    "dist",
    "tmp",
    "seed/export",
    "tests/mnyra-heart-runner/node_modules",
  ],
  detectiveOptions: {
    es6: {
      mixedImports: true,
    },
  },
};
