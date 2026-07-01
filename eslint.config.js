const browserGlobals = {
  Blob: "readonly",
  CustomEvent: "readonly",
  DOMParser: "readonly",
  Event: "readonly",
  File: "readonly",
  FileReader: "readonly",
  FormData: "readonly",
  Headers: "readonly",
  Image: "readonly",
  IntersectionObserver: "readonly",
  KeyboardEvent: "readonly",
  MutationObserver: "readonly",
  Request: "readonly",
  Response: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  alert: "readonly",
  atob: "readonly",
  btoa: "readonly",
  confirm: "readonly",
  crypto: "readonly",
  document: "readonly",
  fetch: "readonly",
  history: "readonly",
  localStorage: "readonly",
  location: "readonly",
  navigator: "readonly",
  performance: "readonly",
  requestAnimationFrame: "readonly",
  sessionStorage: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  window: "readonly",
};

const nodeGlobals = {
  Buffer: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  console: "readonly",
  global: "readonly",
  process: "readonly",
};

export default [
  {
    ignores: [
      "node_modules/**",
      "functions/node_modules/**",
      "apps/menyra-social/bundled/**",
      "dist/**",
      "tmp/**",
      "seed/export/**",
      "tests/mnyra-heart-runner/node_modules/**",
      "shared/vendor/**",
      "apps/menyra-social/vendor/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      "no-console": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-undef": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
