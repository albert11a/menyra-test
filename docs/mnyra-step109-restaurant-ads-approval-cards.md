Status: CURRENT
Last updated: 2026-06-21

# Schritt 109 - Restaurant Ads Approval Cards

## Ziel

Restaurant-/Cafe-Businesses koennen im Menu-Editor Ads mit Bild, Kategorie,
Preisspanne und Delivery-Badges anlegen. Diese Ads duerfen im Restaurant-Tab
erst sichtbar werden, wenn der CEO sie in Heart freigibt.

## Geaendert

- Der bestehende `public/offers`-Pfad wurde fuer Restaurant-Ads erweitert.
- Neue Restaurant-Ads werden im Menu-Editor als `pending` gespeichert.
- Pending-Ads bleiben aus oeffentlichen Profil-/Menu-Fokusflaechen und aus dem
  Restaurant-Tab verborgen.
- Die Restaurant-Hydration liest `public/offers` jetzt auch fuer
  Restaurant-/Cafe-Profile, damit freigegebene Ads fuer den Marketplace
  verfuegbar sind.
- Der obere Restaurant-Slider rendert nur freigegebene Restaurant-Ads als neue
  Premium-Ad-Cards.
- Heart hat einen neuen Tab `Ads` mit Pending/Freigegeben/Abgelehnt-Filtern
  und CEO-Aktionen zum Freigeben oder Ablehnen.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit die Aenderungen im
  gebundelten Entry enthalten sind.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/menu/customer-focus-modal-render-utils.js`
- `apps/menyra-social/core/menu/focus-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-B2XEL0Fe.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BowYCgPx.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-Bi9HySiV.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-BKAhmOWG.js`
- `apps/mnyra-heart/heart-ads-adapter.js`
- `apps/mnyra-heart/heart-ads-render.js`
- `apps/mnyra-heart/heart-events.js`
- `apps/mnyra-heart/heart-render.js`
- `apps/mnyra-heart/heart-route-view-resolver.js`
- `apps/mnyra-heart/heart-state.js`
- `apps/mnyra-heart/heart.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step109-restaurant-ads-approval-cards.md`

## Bewusst Nicht Geaendert

- Keine Firestore Rules oder Cloud Functions.
- Keine QR-, Cart-, Order-, Routing- oder Public-App-Grenzen.
- Keine Aenderung an Restaurant-Listen-Cards unterhalb des oberen Sliders.
- Keine Aenderung an Travel-Oferta-Logik ausser gemeinsamer
  `public/offers`-Datenform.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.
- Keine direkte Arbeit auf `main`; gemaess Mnyra-Regel wurde auf
  `refactorapp` gearbeitet.

## Verifikation

- `node --check apps/menyra-social/core/menu/focus-runtime-controller.js`
- `node --check apps/menyra-social/core/menu/customer-focus-modal-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/public-menu-surface-state-utils.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/mnyra-heart/heart-ads-adapter.js`
- `node --check apps/mnyra-heart/heart-ads-render.js`
- `node --check apps/mnyra-heart/heart.js`
- `node --check apps/mnyra-heart/heart-state.js`
- `node --check apps/mnyra-heart/heart-render.js`
- `node --check apps/mnyra-heart/heart-events.js`
- `node --check apps/mnyra-heart/heart-route-view-resolver.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BowYCgPx.js`
- `node --check apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-BKAhmOWG.js`

Hinweis: Der Build meldet weiterhin die bestehende Vite-Warnung zu grossen
Chunks nach Minifizierung. Das ist kein neuer Fehler dieses Schritts.

## Manuelle Testliste

- Als Restaurant/Cafe einloggen und Profil -> Menu/Editor oeffnen.
- Im Ads-Abschnitt eine neue Ad mit Bild, Titel, Kategorie und Preisspanne
  anlegen.
- Direkt danach den Restaurant-Tab oeffnen und pruefen, dass die Ad noch nicht
  oben im Slider erscheint.
- In Heart den neuen Tab `Ads` oeffnen, die neue Ad unter `Pending` finden und
  freigeben.
- Restaurant-Tab erneut oeffnen und pruefen, dass die Ad oben als Premium-Card
  erscheint und der Button das Restaurantprofil oeffnet.
- In Heart dieselbe oder eine zweite Ad ablehnen und pruefen, dass sie nicht im
  Restaurant-Tab erscheint.
- Ein Travel-Hotel mit Oferta kurz gegenpruefen, dass die Oferta-Verwaltung
  weiter wie vorher funktioniert.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die Freigabe ist aktuell ein App-Workflow auf dem bestehenden
`public/offers`-Pfad. Ohne Rules-/Functions-Aenderung ist die harte serverseitige
Erzwingung der CEO-Freigabe nicht Teil dieses Schritts. Codex hat gemaess
Projektregel keinen Browser-/Smoke-Test ausgefuehrt; die finale Gegenpruefung
erfolgt manuell.
