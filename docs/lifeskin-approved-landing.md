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
