Status: CURRENT
Last updated: 2026-05-10

# Schritt 36: Profil-Beitraege vollstaendig anzeigen

## Ziel

Im Profil sollen alle vorhandenen Foto-/Media-Beitraege sichtbar sein, nicht
nur die ersten durch ein Performance-Limit geladenen oder nur bestimmte Media-
Formate.

## Befund

Es gab drei Ursachen, warum im Profil nicht alle Beitraege sichtbar waren:

- Profil-Reads fuer eigene User-Posts, eigene Business-Posts, externe User-
  Profile und Public-Business-Profile waren auf `FAST_LIMITS.profilePosts`
  begrenzt.
- Einige Profil-Post-Pfade normalisierten nur `url` oder nur
  `media[0].url`/`mediaUrl`; aeltere Daten mit `imageUrl`, `image` oder
  `photoUrl` konnten dadurch ohne sichtbares Bild im Profil landen.
- Der Profil-Tab `Medien` filterte bisher nur `isVideo` und blendete Fotos aus.

## Geaendert

- Die Profil-Post-Reads laden weiterhin nach `createdAt desc`, aber ohne
  `limit(...)`.
- User- und Restaurant-Posts teilen sich jetzt eine robustere Media-
  Normalisierung fuer `url`, `mediaUrl`, `media[0].url`, `media[0].thumbUrl`,
  `imageUrl`, `image`, `photoUrl` und `pictureUrl`.
- Eigene Business-Posts und Public-Business-Posts nutzen dieselbe Restaurant-
  Post-Normalisierung.
- Der Profil-Tab `Medien` zeigt die Profil-Posts nicht mehr nur fuer Videos.
- Das Mnyra-Social-Bundle wurde neu gebaut.
- Ein Unit-Test deckt Legacy-Media-Felder fuer Profil-Posts ab.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
- `apps/menyra-social/core/feed/post-doc-normalize-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/chat-app-runtime-facade-B2o2yfYr.js`
- `apps/menyra-social/bundled/chunks/public-route-cache-early-preload-DX4XHZg5.js`
- `apps/menyra-social/bundled/chunks/public-route-cache-early-preload-DEC2UiOf.js`
- `tests/profile-post-normalization.test.mjs`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step36-profile-posts-full-visibility.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Firebase Rules.
- Keine Functions.
- Keine Routing-Aenderung.
- Keine QR-, Warenkorb-, Menu- oder Produktlogik.
- Keine Smoke-Tests und kein Playwright.

## Validierung

- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
- `node --check apps/menyra-social/core/feed/post-doc-normalize-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --test tests/profile-post-normalization.test.mjs`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/entry/social-public-entry.js`
- `node --check apps/menyra-social/bundled/chunks/chat-app-runtime-facade-B2o2yfYr.js`
- `node --check apps/menyra-social/bundled/chunks/public-route-cache-early-preload-DX4XHZg5.js`
- `git diff --check`

## Manuell testen

- Eigenes User-Profil oeffnen und im Tab `Beitraege` pruefen, ob alte und neue
  Foto-Beitraege sichtbar sind.
- Eigenes Business-Profil oeffnen und `Beitraege` pruefen.
- Ein fremdes/Public-Business-Profil oeffnen und `Beitraege` pruefen.
- Bei User-Profilen den Tab `Medien` oeffnen und pruefen, dass Fotos nicht mehr
  verschwinden.
- Falls der Browser ein altes Bundle zeigt, einmal mit `?sw-reset=1` neu laden.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko: Profile mit sehr vielen Beitraegen laden jetzt bewusst mehr Daten
auf einmal. Das ist der gewollte Tradeoff fuer vollstaendige Sichtbarkeit ohne
neue Pagination-UI.

## Branch-Hinweis

Auf ausdruecklichen Nutzerwunsch wurde dieser Schritt auf `refactorapp`
umgesetzt.
