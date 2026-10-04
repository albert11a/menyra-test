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
