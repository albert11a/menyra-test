# Personal therapy results section

Scope (2026-10-25): transfer the reviewed results preview to the therapy page,
with a divider, open skin illustration, four week buttons, two rounded goal
bars, and a horizontal row showing one and a half equal-height cards.
Keep the existing lazy-loaded personal comparison and its Heart uploads.
Only complete image pairs appear. Percentages are illustrative goals, not
measurements or patient-specific predictions. The diagram's visual seed comes
from the report; it is not a diagnostic model. Follow-up copy includes the
owner-confirmed promise of free additional products when progress falls short.
No tracking, checkout, pricing, Pixel or CAPI changes are in scope.

Validation: `npm run build` passed; tracked generated bundles did not change.
Ten targeted tests passed (week selection/goal updates, illustration identity,
missing-pair behavior, existing comparison uploads/lazy loading and Pixel lock).
`git diff --check` passed. No mobile/browser test was run; responsive sizing
was reviewed in CSS only. Existing Vite circular/large-chunk warnings remain.
