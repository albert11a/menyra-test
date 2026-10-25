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

Follow-up scope: omit the specific guarantee sentence from the results intro
without modifying the stored report. Make the entire comparison image respond
to taps and pointer dragging while retaining native keyboard control and vertical
page scrolling. No tracking or offer changes.

Follow-up validation: build and all 12 targeted tests passed, including taps,
pointer cancellation, keyboard/input preservation and the report-text filter.
Tracked bundles unchanged. Mobile/browser testing was not run.

Focus follow-up scope: prevent touch/mouse taps from drawing a focus outline
around the comparison image; retain a visible focus indicator for keyboard use.
Keep tap positioning, pointer dragging, native keyboard input and lazy loading.

Focus validation: all 12 targeted tests pass, including the no-forced-focus
pointer regression. Build passed on retry after a transient .rsync-tmp file
vanished during the first output pass. Tracked bundles unchanged. Mobile/browser
interaction has not been tested on a device.

Drag interruption scope: reserve touch gestures on the comparison image for
its slider. The previous pan-y allowed mobile browsers to cancel pointer
tracking as soon as a drag gained vertical movement. Disable touch panning and
long-press selection on that input only; scrolling outside the image remains.

Drag validation: 12 existing targeted tests and npm run build passed; no tracked
bundle changes. Mobile/browser gesture verification has not been performed.
