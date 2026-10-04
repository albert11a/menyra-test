
## Validation

- `npm run build`: passed; tracked bundle files did not change.
- Targeted Node tests: 29 passed, one existing failure in
  `lifeskin-landingtiefe.test.mjs` (expects obsolete `held` section).
  Re-running this test against the unchanged main HTML produces the same failure.
- All three Meta Pixel lock checks passed.
- `git diff --check`: passed.
- Layout includes narrow-screen media rules and flexible text columns.
  A real mobile browser check was not run; repository rules require an explicit
  request for Playwright/smoke runs.
