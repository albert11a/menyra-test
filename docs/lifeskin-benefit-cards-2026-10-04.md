
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

## Final reference approved, 2026-10-04

Scope: match the user's final supplied card screenshot and approved HTML
preview. All three cards share the same 60/40 text/phone layout, top alignment,
font sizes, image scale and centered phone position. The cards crop the phone
at their lower edge. Clip only the outside photographic backdrop without
color blending, retaining the supplied screen and case colors. Restore the
original full copy in cards 01/02. Place the existing gallery arrow controls
at the left/right edges of the comparison photos with transparent backgrounds.
Preserve gallery loading, swipe, Heart cases, CTA and Pixel/CAPI behavior.

Final validation: `npm run build` passed; tracked bundle files unchanged.
All 21 selected Node checks passed (approved gallery, landing comparison,
Meta Pixel lock). HTML parser confirms both controls are inside the photo
stage and all three existing phone assets resolve. `git diff --check` passed.
No new test files were added. Physical mobile/browser rendering was not checked;
the approved in-conversation mobile preview is the visual reference.
