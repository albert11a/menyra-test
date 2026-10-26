# LifeSkin Fast

Scope: opt-in Heart header switch for /lifeskin only; four post-photo questions,
no contact screen, server-generated answer-based recommendation on the existing
therapy/checkout route, Fast case chip and separate editable 2/3/4-product prices.
Default off. Existing shop/SkinReact and other routes, Meta Pixel/CAPI and rules
remain unchanged. Work on lifeskin-fast; no automatic main merge or production deploy.

The server issues a session-bound signed Fast ticket while enabled. The ticket
survives refresh/off-switch; existing ready/ordered reports are never overwritten.
Prices are snapshotted when the report is generated. Recommendations use reported
concerns, not invented photo findings or an asserted physician review. Sensitive
answers stay in the private session. Contraindication answers select basic care.

## Operator behavior

- Rounded lightning/Fast control in the primary LifeSkin header; disabled until
  Heart has loaded. Activation first checks the server's service-account access.
- Pricing: primary LifeSkin source pane (Skinreact), Mehr anzeigen -> Fast · Setpreise.
  Saving prices uses a transaction and preserves the current activation switch.
- Intake after photo/scan: up to three concerns, skin type, existing treatment /
  pregnancy / breastfeeding, previous products; then name/age. The telephone
  intake is skipped only for opted-in image cases. Body/question paths and
  LifeSkin Shop/SkinReact keep their existing route. Delivery checkout still
  collects its existing delivery details.
- Acne -> ACNE + MOISTUR. Pores/shine -> PORE + MOISTUR. Spots -> PIGMENT +
  MOISTUR. These combine and deduplicate to at most four products. Moisture /
  elasticity / uncertainty alone -> CLEAN + MOISTUR. Pregnancy/breastfeeding or current medical treatment uses basic care rather
  than automatically adding actives. No claim to treat scars or wrinkles.
- Hidden/missing selected products stop publication; no fabricated catalog or
  ingredients are substituted. The service-account key already used by the
  existing Vercel APIs (`MNYRA_FIREBASE_ADMIN_KEY`) must be available.
- The automatic page explicitly identifies an answer-based selection; it does
  not claim a physician reviewed the image, invent severity scores, diagnose
  conditions or guarantee improvement. Sensitive answers never enter the report.
- Relevant clinical reference for the conservative treatment branch:
  https://www.nhs.uk/medicines/isotretinoin-roaccutane/ (avoid benzoyl peroxide and
  salicylic acid during isotretinoin) and
  https://www.aad.org/public/diseases/acne/derm-treat/pregnancy . These references
  do not certify the individual LifeSkin formulas.

## Validation

- 23 focused Fast rule/API/client/DOM tests passed.
- LifeSkin + Heart regression suite: 1,705 tests passed, including Pixel lock.
- `npm run build` passed. Existing circular-chunk/size warnings remain.
- Generated static output includes the new client code. No tracked bundle files
  changed; no bundle-file commit is necessary.
- No browser/mobile visual run, Playwright, live customer-data test, production
  deployment, rules deployment or automatic main merge performed.

Before release, manually check a 375px phone viewport: Fast on/off, four questions,
name/age -> therapy -> existing checkout, 2/3/4-set prices, reload after interruption,
Fast case chip, price editing, and an unchanged normal/Shop/SkinReact path.

## Follow-up: concern selection and redundant label

Removed the overly broad basic-care triggers for dry skin, redness as a selected
concern and a historical doctor treatment in `perdorimi`. Only explicit safety
answers in `kujdesi` retain the basic-care exception. Acne + pores now keeps
ACNE + PORE + MOISTUR even with dry skin or previously tried treatments; adding
spots gives PIGMENT as the fourth product. No previous medical treatment is
assumed to be current merely because it was tried.

Removed the repeated “Përzgjedhje automatike sipas përgjigjeve tuaja.” line from
Fast pages. The method explanation still accurately identifies the recommendation
as answer-based and does not claim an unperformed physician review. Previously
generated reports/prices are not rewritten; new analyses use the corrected rules.

Validation: 1,706 LifeSkin/Heart tests passed including the updated regression
cases and Pixel lock; build passed, no tracked bundle changes. No mobile browser
visual run or live patient-data changes.

## Follow-up: all public galleries and exclusive Fast case category

Fast pages now load every active customer-gallery photo/video in Heart order,
including pagination beyond twelve entries. No private session photographs are
queried. Disabled media remain disabled. The existing media viewer, comments,
crop and video handling are reused. All published before/after cases are shown,
regardless of the products in the customer's set; cases disabled on every public
surface and incomplete image pairs stay hidden. This applies to existing Fast
pages too, without rewriting stored reports. Other analysis pages retain their
per-report media/case selection.

Fast cases now belong only to the Fast case category, never Open/Ready/Seen/
Checkout/Ordered case categories. Manual Later/Archive status still takes
precedence; the separate order overview and revenue calculations retain orders.

Validation: 30 focused Fast tests and 1,712 LifeSkin/Heart tests passed, including
real gallery DOM rendering beyond twelve pictures, pagination, hidden content,
all before/after product sets and category exclusivity through every case stage.
Build passed; no tracked bundle changes. No mobile browser visual run.

## Follow-up: remove method accordion from Fast pages

Hide the complete “Si vlerësohet?” accordion on Fast pages, clear its body and
close any open state. This includes already-created Fast reports; normal reports
retain their existing method section. The separate answer-based set description
remains. Focused Fast/Pixel tests and build passed; no tracked bundle changes.
No mobile browser visual run.
