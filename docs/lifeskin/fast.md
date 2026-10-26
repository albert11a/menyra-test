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
  elasticity / uncertainty alone -> CLEAN + MOISTUR. Dry or sensitive skin,
  pregnancy/breastfeeding or current medical treatment uses basic care rather
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
