# LifeSkin follow-up card polish

Albert authorized on 11 October 2026: fix hero rounding, rename the message
eyebrow to LifeSkin ne Instagram, restore the iPhone profile image as first
card using the current card style, add font-sized stars before the review
average, and combine current section statistics into Shop with its existing
checkout stages and revenue. Commit and main publishing authorization
continues from the same task. Pixel/input timing is unchanged.

Performance scope: reuse the local Instagram asset, preserve that card on
Heart message refresh, keep lazy media loading and avoid extra requests.
No production orders/data writes. Browser smoke/Playwright not requested.

Implemented: both applicable hero rules use 18px rounding (the previous
14px rule was overridden by a later 3px hero-set rule). The profile card
reuses the 81,054-byte local JPEG with lazy loading and reserved dimensions.
Heart refresh preserves its DOM node, including when no messages are enabled;
the rail counter includes it. Summary stars inherit the numeric font size,
including fractional rating fill. Shop shows 14 observed sections, checkout
stages numbered 15-18, revenue and the original purchase summaries. A saved
Seite selection falls back to Shop; the extra chip is removed.

Validation:
- npm test: 3,192 passed, zero failures.
- Final scoped review/rail/Shop/performance/Pixel tests: 68 passed.
- npm run build passed; tracked bundles unchanged.
- Scoped ESLint: zero errors, one existing unused renderer warning.
- git diff --check passed.
- No Pixel code/call-site changes, added libraries or blocking media requests.

Mobile CSS cascade and screenshot inspected. Physical mobile browser and
live speed were not measured; no Playwright/smoke run under AGENTS.md.
Manual mobile checks: rounded hero with custom and default images; Instagram
card first before/after Heart load; swipe counter includes it; font-sized
summary stars; merged Shop rows, checkout counts and revenue.
