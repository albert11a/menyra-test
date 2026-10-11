# LifeSkin shop mobile UI and checkout measurement

Authorized by Albert, 11 October 2026: round the hero image slightly more;
simplify only the routine intro; hide the floating chat with a reversible
Heart chat visibility switch; audit current shop statistics; commit and push main.

Pixel-Aenderung erlaubt von Albert am 11.10.2026: /lifeskinshop
InitiateCheckout erst bei der ersten nichtleeren Eingabe im Kassenformular,
nicht beim Oeffnen. Heart und Kassenmeldung folgen derselben Handlung.
AddToCart, Purchase, consent, event IDs, payloads and CAPI remain unchanged.
Input includes typing, paste and browser autofill; focus alone is not input.

Historical checkout opens remain inspectable, but are not evidence of a
started shop checkout. No production data migration or test orders.
Existing chat activity settings remain separate from new default-off visibility.

Implemented: hero radius 14px; compact routine intro; default-hidden chat
with Heart visibility switch; checkout input and change/autofill trigger.
Heart uses input evidence for historical shop visits and keeps opening
details inspectable. Other analysis checkout definitions are unchanged.
The new Seite view measures 14 current sections independently; existing
historical scroll-depth calculations retain their original IDs and versions.

Validation:
- npm test: 3,190 passed, zero failed. The initial run found two obsolete
  screen-opening expectations, updated to the authorized input definition.
- Final scoped regressions: 235 passed after preserving the narrower
  non-shop follow-up condition. Includes checkout, Heart, chat and Pixel lock.
- npm run build: passed; tracked bundle files unchanged.
- Scoped ESLint: zero errors, three existing unused-variable warnings.
- git diff --check: passed.

Mobile CSS and DOM contracts inspected. Browser automation was not requested
and was not run under AGENTS.md. Physical mobile QA and live Meta delivery
remain unchecked; no production orders or historical data writes were made.
Manual mobile checks: open checkout without input (no checkout event), type
or autofill a field (one event), edit/reopen (no duplicate), confirm hero and
routine intro at 320-430px, toggle Heart chat visibility and reload the shop.
