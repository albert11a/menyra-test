Status: CURRENT
Last updated: 2026-06-21

# Schritt 109 - Restaurant Ads System

## Ziel

Restaurants, Cafes und Ecommerce-Profile sollen im Menu Editor eigene Ads
erstellen koennen. Diese Ads duerfen erst nach Freigabe in Mnyra Heart in der
kleinen horizontalen Restaurant-Swipe-Zeile erscheinen. Die grossen
Restaurant-Cards bleiben unveraendert.

## Geaendert

- Ein eigener Ads-Runtime-Controller speichert Ads unter
  `restaurants/{restaurantId}/public/ads`.
- Neue oder bearbeitete Ads werden mit Status `pending` gespeichert und muessen
  in Heart freigegeben werden.
- Der Menu Editor zeigt fuer passende Restaurant-/Cafe-/Food-/Ecommerce-Profile
  eine separate Ads-Sektion im Stil der bestehenden Fokus-Verwaltung.
- Die bestehende Fokus-Modal-Infrastruktur wird im Ads-Kontext wiederverwendet
  und ergaenzt: Bild, Kategorie, Preisspanne und Badge-Schalter koennen
  gepflegt werden.
- Die kleine horizontale Restaurant-Swipe-Zeile zeigt nur freigegebene Ads und
  nutzt die neue Premium-Card-Struktur mit Bildbereich, Badges, Rating- und
  Preiszeile sowie Profil-Button.
- Mnyra Heart hat einen neuen CRM-Tab `Ads`, der pending/approved/rejected Ads
  lesen und Ads akzeptieren oder ablehnen kann.
- Restaurant-Metadaten und Session-Preserve-Logik kennen nun Public-Ads, damit
  geladene Ads nicht durch rohe Restaurantdaten ohne Ads-Payload verloren gehen.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit die Aenderung im
  gebundelten Entry und in den Hash-Chunks enthalten ist.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/menu/ads-runtime-controller.js`
- `apps/menyra-social/core/menu/customer-focus-modal-render-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/overlays/overlay-orchestration-controller.js`
- `apps/menyra-social/core/app-events/app-events-main-bind-utils.js`
- `apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/bridge-shell-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/marketplace/restaurant-view-event-bindings.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-B2XEL0Fe.js`
- `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BzXlu_wd.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-Bi9HySiV.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-cTXM1D7c.js`
- `apps/menyra-social/bundled/chunks/travel-view-event-bindings-CFyexvf5.js`
- `apps/menyra-social/bundled/chunks/travel-view-event-bindings-BA_w3-GZ.js`
- `apps/mnyra-heart/heart.js`
- `apps/mnyra-heart/heart-state.js`
- `apps/mnyra-heart/heart-render.js`
- `apps/mnyra-heart/heart-route-view-resolver.js`
- `apps/mnyra-heart/heart-events.js`
- `apps/mnyra-heart/heart.css`
- `apps/mnyra-heart/heart-crm-admin-read-loaders.js`
- `apps/mnyra-heart/heart-crm-admin-read-view.js`
- `apps/mnyra-heart/heart-crm-admin-shell-consumer.js`
- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step109-restaurant-ads-system.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an den grossen Restaurant-/Cafe-List-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules, Functions oder
  Produktlogik ausserhalb des neuen Ads-Pfads.
- Keine Aenderung am bestehenden Fokus- oder Speisen-/Produkt-Datenpfad.
- Keine direkte Arbeit auf `main`; gemaess Mnyra-Regel wurde auf
  `refactorapp` gearbeitet.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check` fuer die geaenderten Social- und Heart-JavaScript-Dateien.
- `npm run build:menyra-social:bundle`
- `git diff --check`
- Konfliktmarker-Suche mit `rg -n "<<<<<<<|=======|>>>>>>>"`.

Hinweis: Der Social-Bundle-Build meldet weiterhin die bestehende Vite-Warnung
zu grossen Chunks nach Minifizierung. Das ist kein neuer Fehler dieses
Schritts.

## Manuelle Testliste

- Als Restaurant oder Cafe Profil -> Editor oeffnen und pruefen, dass eine
  separate Ads-Sektion sichtbar ist.
- Eine neue Ad mit Bild, Kategorie, Preisspanne und Badges speichern; danach
  pruefen, dass sie als `pending` markiert ist.
- In Mnyra Heart den Tab `Ads` oeffnen und die neue Ad akzeptieren.
- Restaurant-Tab oeffnen und pruefen, dass die kleine horizontale Swipe-Zeile
  die freigegebene Ad im neuen Premium-Card-Stil zeigt.
- Dieselbe Ad in Heart ablehnen oder eine neue pending Ad anlegen und pruefen,
  dass pending/rejected Ads nicht in der Restaurant-Swipe-Zeile erscheinen.
- Die grossen Restaurant-/Cafe-Cards kurz gegenpruefen; sie sollen unveraendert
  wirken.
- Mit einem Ecommerce-Profil eine Ad erstellen und in Heart pruefen, dass sie
  im Ads-Tab zur Freigabe erscheint.
- QR, Public Menu, Warenkorb und Order-Flows kurz gegenpruefen, weil sie in
  diesem Schritt bewusst nicht veraendert wurden.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Gegenpruefung muss manuell mit Restaurant-/Cafe-,
Ecommerce- und Heart-Zugang im Browser erfolgen.
