# LifeSkin scroll landing

Scope: implement the approved 2 October 2026 preview on `/lifeskin` only.
Lead with online skin assessment, dermatologist and tailored products. Keep
the existing selection, scan/photo preparation, questions, analysis and order
flow. Keep the existing comparison markup, shapes, swipe navigation and Heart
case source. Every start button uses the existing funnel entry handler; the
preview-only dialog is omitted. Pixel and CAPI code and calls are unchanged.

Three illustrations move with scrolling: camera/scan, dermatologist assessment
and individual care plan. Only visible illustrations are measured, at most
once per animation frame. Reduced motion and unavailable observer support keep
a readable static illustration. Below-fold images load lazily and retain
intrinsic dimensions. Product illustrations are examples, not a universal
prescription. Analysis cost is disclosed in FAQ rather than the hero.

Validation:
- `npm run build`: passed. No tracked social bundle files changed; the new
  landing CSS/JS/images are present in `dist`.
- 112 focused Node tests passed, including the pixel lock, case loading/races,
  selection/questions and existing funnel behavior.
- Real local page at 320×480, 390×664, 430×780 and 760×900: no horizontal
  overflow or duplicate IDs. All three CTAs open the existing selection.
  Scan and photo choices open their correct preparation screens. Case arrows,
  scroll-linked motion and reduced motion were verified without remote writes.
- No page JavaScript errors. Local loopback responded with HTTP 200; the
  workspace cannot expose the private LAN address 192.168.1.168.
- No production test orders, Firebase writes or Pixel/CAPI changes.


## Scan illustration refinement

Only the first illustration now uses the actual camera's light surface,
round face area and 40 marks (8 sectors × 5) with its existing ring colors.
A simple Face-ID-like line icon looks left/right; captured sectors turn
green. There is no camera permission or recording in this illustration.
The photo shutter and oval sweep are removed. Animation pauses when the
illustration is out of view, the document is hidden, or the funnel leaves
its landing. Reduced motion shows a static frontal head; no JavaScript keeps
a static CSS illustration. The actual camera runtime is unchanged.

Validation: 55 focused tests passed. Mobile widths 320/390/430 and desktop
760 have no horizontal overflow; funnel transitions and comparison navigation
remain functional. Canvas frames change during a head turn and stay identical
with reduced motion. No JavaScript page errors. Build passed, tracked bundle
files unchanged.

## Photo alternative and early proof

The initial refinement had keyboard-accessible scan/photo tabs and an always
visible explanation that only a skin area can be photographed. The photo demo
uses the existing photo page’s portrait frame, shutter and camera-switch icon,
with a cropped real cheek photo. Both demos are illustrations, without camera
access. The real funnel and analytics remain unchanged.

The initial refinement placed paired before/after thumbnails before the CTA, linking to the existing
comparison section. They follow the enabled Heart case list, load pairs
atomically and ignore stale updates. Empty configurations or failed configured
photos hide this early proof instead of showing unconfigured cases.

## Visible method alternatives and Instagram proof

Scope: replace the demo tabs with two permanently visible, vertically stacked
scan/photo examples inside step 01. Use tall phone proportions, short method
headings and independent scroll progression for each stage. Keep the real
funnel, case carousel and Pixel/CAPI untouched.

A compact Instagram block directly after the hero introduction uses the
provided profile screenshots as avatar sources and links to @lifeskin.ks
and @lifeskin.al. Counts are 73.9k and 108k, as shown in the user screenshots
on 2 October 2026; they are snapshots, not live counters or customer counts.
The earlier thumbnail strip is removed to avoid stacking competing proof
blocks ahead of the first CTA. The full before/after section stays unchanged.

Validation: 55 focused tests passed; build passed with no tracked bundle
changes. Mobile widths 320/390/430 and desktop 760 show no horizontal
overflow or duplicate IDs. Both examples are visible without switching tabs
and remain vertically stacked; phones have approximately 0.47 width/height
before rotation. Scan animation and reduced motion work, the photo frame
fits above the shutter, all three CTAs and both preparation paths work.
No JavaScript errors. Loopback responds; the private LAN IP is unavailable
in this workspace. No production orders or remote writes were used for tests.

## Compact three steps (latest revision)

The hero no longer includes Instagram or concern chips. Instagram now follows
the untouched before/after section as two equal cards side by side, using
provided profile images and follower snapshots. Cards enter with subtle
scroll-linked movement; reduced motion leaves them fully visible and still.
The explanation uses three short heading/caption pairs before their visuals:
scan/photo/description, Dr. Gashi assessment, personal plan. Step 01 uses the
existing animated icon scan illustration; the separate photo illustration and
repeated method descriptions are omitted. The dermatologist image is smaller.
Funnel, comparison cases and Pixel/CAPI behavior are unchanged.

Validation for the compact revision: 55 focused tests and build passed.
No tracked bundle changes. Mobile widths 320/390/430 and desktop 760 have
no horizontal overflow or duplicate IDs; the first CTA ends at 368/394/405
CSS pixels on the three mobile sizes. Instagram follows the comparison,
its cards share a row, and the hero has no Instagram block or concern chips.
All three CTAs, both preparation routes, comparison navigation, scan motion
and reduced motion work. No page JavaScript errors.
