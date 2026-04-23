# Launch Closure Contract Board (Batch A)

Stand: 2026-03-31  
Referenz:
- `MENYRA_SYSTEM_KERNANALYSE_2026-03-30.md`
- `MENYRA_LAUNCH_CLOSURE_PLAN_2026-03-31.md`

Arbeitsregel: Pro Block erst Vertrag und Abnahmekriterien finalisieren, dann Umbau starten.

## 1) Notifications / Push

- Name des Problems: Client-seitige Fremd-Notification-Writes und unklare Push-Autoritaet.
- Hauptdateien:
  - `firestore.rules`
  - `functions/index.js`
  - `apps/menyra-social/core/notifications/notification-support-runtime-controller.js`
  - `apps/menyra-social/core/chat/chat-runtime-controller.js`
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- Spaetere Hauptwahrheit:
  - serverautoritatives Notification-Event in Functions
  - `users/{uid}/notifications/{nid}` als Read-Model pro Zielnutzer
  - Push nur aus validierten serverseitigen Events
- Vor Umbau klaeren:
  - erlaubte Event-Typen und Actor/Target-Matrix
  - idempotenter Notification-Key pro Event-Typ
  - Firestore-Rule-Matrix fuer read/write pro Rolle
  - Negativtests fuer Fremdschreibversuche
- Fertig wenn:
  - kein fremder Notification-Write per Client moeglich
  - legitime Chat/Like/Order-Notifications laufen weiter
  - Push-Dispatch ist nur serverseitig ausloesbar

## 2) Restaurants / Business Identity / Geo

- Name des Problems: Teil-Wahrheit aus Bootstrap, spaete Voll-Wahrheit aus Full-Load, unehrliche Geo-Fallbacks.
- Hauptdateien:
  - `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
  - `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
  - `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
  - `apps/menyra-social/core/map/geo-coord-utils.js`
  - `functions/index.js`
- Spaetere Hauptwahrheit:
  - `restaurants/{rid}` als kanonische Business-Identitaet und Geo-Quelle
  - Bootstrap nur als markiertes Preview-Read-Model
- Vor Umbau klaeren:
  - Pflichtfelder fuer Identity-Versionierung (`updatedAt`/`version`)
  - Umgang mit fehlenden Koordinaten (explizit unbekannt)
  - Reconcile-Regel zwischen Preview und Kanon
- Fertig wenn:
  - Feed, Profil, Discovery und Karte zeigen dieselbe Restaurant-Wahrheit
  - keine erfundenen Marker-Koordinaten mehr
  - Standortwechsel wird als echte Aenderung erkannt

## 3) Menu / QR

- Name des Problems: Hybrid-Menuquellen und implizite QR-Semantik.
- Hauptdateien:
  - `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
  - `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  - `apps/menyra-social/core/menu/table-qr-runtime-controller.js`
  - `apps/menyra-social/core/menu/menu-modal-render-utils.js`
  - `apps/menyra-social/core/router/deeplink-flow-utils.js`
  - `functions/index.js`
- Spaetere Hauptwahrheit:
  - Authoring: `restaurants/{rid}/menuItems`
  - Public Read Model: `restaurants/{rid}/public/menu`
  - QR nur ueber expliziten Kontext (`source=qr` oder eigener Pfad)
- Vor Umbau klaeren:
  - eindeutiger Publish-Trigger (nur beim Write/Backfill)
  - Legacy-Backfill-Reihenfolge und Cutover-Kriterium
  - Deeplink-Vertrag fuer `tab=menu` vs QR
- Fertig wenn:
  - Gast, User und QR lesen dieselbe Public-Menuwahrheit
  - erster Gast-Lesezugriff schreibt nichts mehr
  - source-loser Menu-Link erzeugt keine QR-Spezialsemantik

## 4) Orders / Waiter / Guest

- Name des Problems: Drift-Risiko zwischen Restaurant-Order, User-Mirror, Guest-Recovery und Waiter-Status.
- Hauptdateien:
  - `apps/menyra-social/core/orders/orders-runtime-controller.js`
  - `apps/waiter/waiter-app.js`
  - `apps/waiter/sw.js`
  - `functions/index.js`
  - `firestore.rules`
- Spaetere Hauptwahrheit:
  - kanonisch: `restaurants/{rid}/orders/{orderId}`
  - User-Orders als serverseitiger Mirror unter `users/{uid}/orders/{orderId}`
  - Guest-Recovery ueber Session-ID oder Order-Token
- Vor Umbau klaeren:
  - Status-Transition-Regeln und Berechtigungen
  - idempotente Erzeugung und Mirror-Sync
  - Guest-Recovery-Schema und Ablauf bei Reload
- Fertig wenn:
  - Waiter, Business, User und Guest sehen denselben Order-Status
  - Guest-Order ist nach Reload auffindbar
  - Waiter-Push ist reproduzierbar stabil

## 5) Posts / Feed / Profile / Story / Chat

- Name des Problems: Mehrfachhaltung und spaete Reconcile-Korrekturen in Content- und Kommunikationspfaden.
- Hauptdateien:
  - `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js`
  - `apps/menyra-social/core/profile/profile-open-flow-utils.js`
  - `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
  - `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
  - `apps/menyra-social/core/stories/story-feed-runtime-controller.js`
  - `apps/menyra-social/core/stories/story-viewer-runtime-controller.js`
  - `apps/menyra-social/core/chat/chat-runtime-controller.js`
- Spaetere Hauptwahrheit:
  - Post-Inhalt kanonisch im Post-Dokument (`restaurants/.../socialPosts/{postId}`)
  - Feed als Projection/Summary
  - Story-Daten getrennt von Feed-Fallback-UI
  - Chat mit sichtbarem `pending/failed` Remote-Status
- Vor Umbau klaeren:
  - zentraler Reconcile-Pfad fuer Post-Updates
  - Placeholder-Regeln (schnell, aber nie als echte Wahrheit)
  - Fehlervertrag fuer Chat-Senden und Retry
- Fertig wenn:
  - Feed, Profil und Modal zeigen denselben Post-Stand
  - Story-Quelle ist eindeutig und nachvollziehbar
  - Chat zeigt Fehlschlag sichtbar und recoverbar

## 6) Guest Scoping

- Name des Problems: Browserweit geteilter Gastzustand statt besucherbezogener Session-Wahrheit.
- Hauptdateien:
  - `apps/menyra-social/core/storage/social-storage.js`
  - `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - `apps/menyra-social/core/auth/session-tab-guards.js`
  - `apps/menyra-social/core/orders/orders-runtime-controller.js`
- Spaetere Hauptwahrheit:
  - eindeutige Guest-Session-ID pro Besucher
  - Cart/Order-Hinweise an Guest-Session gebunden
- Vor Umbau klaeren:
  - Session-Lebensdauer und Reset-Regeln
  - Verhalten bei Mehrtab und Reload
  - Datenschutzgrenzen fuer Gastpersistenz
- Fertig wenn:
  - neuer Gast sieht nie alten Gast-Cart
  - Guest-Cart und Guest-Order bleiben ueber Reload konsistent

## 7) Performance / Vendor Hardening / Degraded Modes

- Name des Problems: unklare Zeitbudgets, globale Repaint-Hotpaths, fragile Runtime-Abhaengigkeiten.
- Hauptdateien:
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - `apps/menyra-social/index.html`
  - `apps/menyra-social/pwa.js`
  - `apps/menyra-social/sw.js`
  - `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
  - `apps/waiter/index.html`
  - `apps/waiter/waiter-app.js`
  - `apps/waiter/sw.js`
  - `shared/firebase-config.js`
- Spaetere Hauptwahrheit:
  - messbare Performance-Budgets pro Hot Path
  - definierte Vendor-Strategie (Versionierung/Self-hosting/Degraded-Fallback)
  - verbindliche Degraded-Mode-Vertraege pro Ausfallklasse
- Vor Umbau klaeren:
  - Zielbudgets pro Persona-Flow
  - Liste kritischer Vendor-Abhaengigkeiten mit Owner
  - Fallback-UX pro Ausfall (Bootstrap, Karten, Push, Media, Fonts)
- Fertig wenn:
  - Budgetpfade bleiben auf Slow- und Fast-Profilen im Ziel
  - Vendor-Ausfall fuehrt zu ehrlicher stabiler Fallback-UI
  - keine stillen Mischzustaende aus alten/stalen Quellen

## 8) Release Gates / Observability

- Name des Problems: manuelle Gate-Steuerung und fehlende zentrale Fehlerauswertung.
- Hauptdateien:
  - `tests/mnyra-heart-runner/package.json`
  - `tests/mnyra-heart-runner/src/...`
  - `.github/workflows/mnyra-heart-smoke.yml`
  - `.github/workflows/mnyra-heart-synthetic.yml`
  - `shared/runtime-error-reporter.js`
  - `functions/package.json`
  - `shared/package.json`
- Spaetere Hauptwahrheit:
  - verpflichtende Release-Gate-Definition in CI + Journey-Packs
  - zentrale Fehlererfassung mit Session/Persona-Kontext
- Vor Umbau klaeren:
  - welche Packs fuer Deploy verpflichtend sind
  - welche `warning/not_configured` fuer Pflicht-Gates unzulaessig sind
  - Signoff- und Rollback-Verantwortung
- Fertig wenn:
  - Pflicht-Packs laufen ohne `warning/not_configured`
  - Gate ist vor Launch zwingend
  - Fehler sind zentral pro Session/Persona auswertbar
