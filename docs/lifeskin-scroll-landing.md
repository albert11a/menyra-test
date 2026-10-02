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

