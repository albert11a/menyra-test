# Heart Shop layout

Scope: align Shop/Analyse live steps with funnel columns 1, 2, 4, 5. Move the Shop statistics card directly below live cards. Include existing Kauf/Bericht data in this card. Swipe chips in two snapping groups: Shop/Scan/Foto/Analyse, then Kauf/Bericht; preserve existing scroll restoration. No tracking or data changes.

Validation: 75 existing/updated tests passed (shop-weg, live, live-cash, pixel-sperre). npm run build passed; no tracked bundles changed. git diff --check passed. Mobile browser verification not run (AGENTS.md forbids unsolicited Playwright/smoke runs).

Follow-up: Gjeni analysis joins page 2 after Kauf/Bericht. Both pages retain four equal columns; individual chip snap targets disabled. Cases use the same paged chips inside the card (also when empty). Scope authorized for main by user. Validation: 75 shop/live/pixel tests passed; npm run build passed; no tracked bundle changes; git diff --check passed. Mobile browser not checked.
