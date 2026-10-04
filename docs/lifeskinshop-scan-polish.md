# LifeSkin Shop: compact scan and result

Status: IMPLEMENTED; physical mobile QA outstanding, 2026-10-04.

Authorized scope: audit /lifeskinshop functionality and performance, reduce scan section height for narrow/short screens, improve on-brand completion/result motion and make the evaluated set easier to understand and order. Preserve camera capture/crop, stored assessment, cart/checkout and all Pixel/CAPI lines. No new result or approval logic.

Implementation: viewport-aware shared scan diameter; original camera fits that exact slot; shorter readable guidance; CSS completion/check animation and concise product explanation; no additional image downloads on the result. Move scan CSS into the head to avoid late restyling. Reuse existing scoped regression tests and required build. Browser/mobile visual QA and physical camera verification remain outstanding if local preview access is blocked.


Validation:
- 86 scoped Node checks pass: SkinReact rendering/polling/resume, actual cart callback and low-suitability advice, shop ordering, camera/ring/pose/network recovery and immutable Pixel/CAPI.
- `npm run build` succeeds. Tracked social bundles do not change. No production deployment command run.
- Extended shop guidance suite has 3 existing failures (old pre-SkinReact text/flow expectations). Same 3 failures reproduced on unchanged origin/main c00e32d; tests left intact.
- Local cloud-browser navigation was blocked (ERR_BLOCKED_BY_CLIENT); mobile visual QA, physical iPhone camera, live staff result, real order and real-world speed measurements were not performed. Local preview availability could not be confirmed.
- Header/guide/button use natural wrapping, camera remains a square and live video/capture crop remains unchanged. Height-aware sizing has a fallback for browsers without svh. Reduced motion disables animation; offscreen idle guide motion pauses.
- No claim of universal screen compatibility or measured load-time improvement; these need device checks before release.

Manual review before main: iPhone Safari/Instagram and Android Chrome at 320/360/390/430 px; short screen and text enlargement; allow/deny permission, cancel/reopen, capture progress, background/foreground; stored approval/high and low ranges; result → cart → checkout without placing a real order.

## Correction requested 2026-10-04
Keep the section footprint across idle, camera, processing and result. Render processing/result as an overlay within the original reserved section instead of collapsing header, guidance and controls. Hide the persistent shop CTA whenever the scan section intersects the viewport; restore it outside scan/hero. Replace the looping green preview progress/cartoon and scale/glow motion with a face-frame guide, quiet processing arc and actual three-phase status. Approved main publication continues from the same session.

Correction validation: 88 scoped Node checks pass, including independent hero/scan observer notifications, return of sticky outside scan, retained disabled start-button placeholder through processing and restoration on back. Required build passes; tracked bundles unchanged. Physical mobile/visual camera verification remains outstanding (local cloud-preview access unavailable). No Pixel/CAPI lines changed.

## Final panel correction, 2026-10-04
User reports visible UI errors: preserve heading through processing; remove back-to-page action and photo-storage line; result must be a clean rectangular assessment rather than reuse the circular camera. Replace full-section overlay with a dedicated workspace below the persistent heading. Workspace geometry is owned by the scan layout, while processing and result replace only its contents. Prevent scroll anchoring inside the transitioning workspace. Keep existing approval, purchase callback, capture/crop, sticky suppression and Pixel/CAPI unchanged.

Validation: 89 scoped Node checks pass, including absence of back actions and circular result display, correct high/low assessment ordering gates, original camera behavior and immutable Pixel/CAPI. Required build passes, tracked bundles unchanged. HTML parser confirms title remains outside the workspace and original start button inside it. No physical mobile/visual camera test performed; actual handset review remains necessary. Processing/result do not change workspace footprint; long enlarged content can scroll within the workspace rather than move the surrounding page.
