# Approved /lifeskin landing

Status: CURRENT
Last updated: 2026-10-01

The user approved replacing `/lifeskin` with the supplied Albanian screenshot
layout and explicitly requested a commit and push to `main`.

The page uses the approved hero, comparison, concern selector, three steps,
doctor, personal plan, pricing explanation, FAQ and final analysis button.
Both cases use original repository photos in one fixed frame, with shared
PARA/PAS labels and sticker. Photos change only after the complete next pair
loads; older pending requests cannot overwrite the latest selection.

The two analysis buttons enter the existing analysis flow. Its screens and
handlers are retained. Pixel/CAPI files and call sites are unchanged.
The retained `/lifeskin2` shopping layout continues to have its existing
regression coverage; `/lifeskin` now shows the approved pricing explanation
instead of the former product grid and checkout.

Validation: 64 relevant Node tests pass, including photo switching, retries,
concern selection, funnel entry and the existing pixel lock. `npm run build`
passes; tracked social bundle files are unchanged. No mobile browser or
Playwright check was run. Mobile sizing follows the approved preview using
container-relative dimensions and a fixed comparison aspect ratio.

## Approved refinements

The concern selector is removed. The photo comparison uses shared previous/next
controls on the image and beneath it, a case counter, and “Kohëzgjatja / 4 javë”.
All landing icons are vendored Lucide 0.468.0 artwork, with its ISC license.
The pending layout was rendered at phone widths 320, 390 and 440, and width 760;
there is no horizontal overflow and arrow targets are at least 44 pixels. Both
arrow locations switch the pair. These are Chromium mobile emulation checks,
not a physical iPhone test. Build and 64 relevant tests pass; tracked social
bundles are unchanged. The user approved committing and pushing these refinements to main on 2026-10-01.

## Landing case connection and step spacing

The steps now use the regular section padding after the lime band. The approved
comparison reads all Heart cases marked for landing via the existing shared
case/image loader; the separate oben flag does not exclude landing cases.
The four standard cases remain available if configuration is absent or offline.
An explicitly empty Heart selection hides the comparison. Counters and arrow
wraparound follow the loaded list; the shared frame and photo-load guard remain.

Validation: 82 scoped tests pass, including the pixel lock and mocked Heart
configuration/image documents. A local Chromium render using five landing cases
and one excluded analysis-only case reaches every selected case with the arrows.
The gap above the steps measures 19.8/24.2/27.3 pixels at widths 320/390/440.
Build passes; tracked social bundle files remain unchanged. No production data
was used for these checks. Commit/push approved by the user on 2026-10-01.
