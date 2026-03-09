# MNYRA Social Platform
Stand: 2026-03-09

Dieses Repository ist auf eine zentrale App reduziert: **MNYRA Social**.
Alte Einzel-Apps (ceo/owner/staff/restaurants) sind als kompatible Routen auf Social gemappt.

## 1) Produkt-Scope
Aktive Haupt-App:
- `apps/menyra-social/`

MNYRA Social vereint:
- Social Feed + Stories
- Discover/Suche + Karte
- Profile (User und Business)
- Chat (1:1)
- Benachrichtigungen + Push
- Shop/Menu + Warenkorb + Bestellungen
- CRM fuer CEO (Leads, Staff, Customers)

## 2) Rollen und Faehigkeiten
### Gast (nicht eingeloggt)
- Kann Feed, Suche, Karte, Orders-Ansicht und oeffentliches Profil nutzen.
- Kann Shop-Warenkorb nutzen und als Gast bestellen (mit Kontaktformular).
- Sieht keinen Chat, keine Notifications, keine CRM-Tabs.

### Registrierter User
- Alles aus Gast plus:
- Follow/Unfollow, Follow-Requests, Likes, Kommentare.
- Chat mit anderen Profilen.
- Eigene Posts/Profilpflege/Settings.
- Eigene Notifications und eigene Order-Historie.

### Business (Owner)
- Business-Profil mit `restaurantId` und Rolle `business`.
- Feed-Posts als Business erstellen.
- Menu/Shop Items verwalten (inkl. Bildgalerie, Varianten, Crop/Fokus).
- Focus-Items verwalten.
- Restaurant-Orders live sehen.
- Offers/Public Meta pflegen.

### CEO / CRM
- Tabs: Leads, Staff, Customers.
- Scope-Filter (own/staff/archived) mit Pagination und Cache.
- Lead -> Customer Uebernahme/Mapping.
- Staff-Verwaltung inklusive Rollen/Ownership-Meta.
- Rollen-Switch Links (ceo/owner/staff), falls Rollen vorhanden.

## 3) Bereiche (Tabs) im App-Shell
Haupt-Tabs:
- `feed`
- `chat`
- `search`
- `map`
- `profile`
- `menu`
- `orders`
- `notifications`
- `settings`
- `upload`
- `leads` (CEO)
- `staff` (CEO)
- `customers` (CEO)

Zusatznavigation:
- Profil-Top-Tabs fuer Business: `profile`, `menu`, `cart`.

## 4) Routing und Kompatibilitaet
Primarer Einstieg:
- `/` -> `/apps/menyra-social/index.html`

Kompatibilitaets-Routen (vercel rewrites):
- `/ceo` -> `?tab=leads`
- `/owner` -> `?tab=profile`
- `/staff` -> `?tab=staff`
- `/waiter` -> `?tab=menu`
- `/kitchen` -> `?tab=menu`
- Alte App-Pfade unter `/apps/menyra-*` werden auf Social umgeleitet.

Wichtige Query-Parameter:
- `tab`, `view`, `top`
- `auth=login|register`
- `r` oder `restaurant`
- `notif` / `notification` / `nid`
- `post` / `postId`
- `chat` / `thread`

## 5) Firebase: Architektur und Datenmodell
Client:
- Browser ES Modules (Firebase 11.0.0)
- Datei: `shared/firebase-config.js`
- Auth Persistence:
  - indexedDB local
  - browser local
  - browser session
- Firestore:
  - `experimentalAutoDetectLongPolling: true`
  - persistent local cache mit multi-tab manager

Wichtige Collections im Frontend:
- `users/{uid}`
- `users/{uid}/devices`
- `users/{uid}/notifications`
- `users/{uid}/followRequests`
- `users/{uid}/following`
- `users/{uid}/posts`
- `users/{uid}/orders`
- `users/{uid}/menuFavorites`
- `users/{uid}/chatThreads`
- `restaurants/{rid}`
- `restaurants/{rid}/public/meta`
- `restaurants/{rid}/public/menu`
- `restaurants/{rid}/public/offers`
- `restaurants/{rid}/socialPosts`
- `restaurants/{rid}/menuItems`
- `restaurants/{rid}/menuSocial`
- `restaurants/{rid}/orders`
- `restaurants/{rid}/stories`
- `restaurants/{rid}/staff`
- `socialFeed/{postId}`
- `leads/{leadId}`
- `superadmins/{uid}`
- `staffAdmins/{uid}`
- `staffIndex/{uid}`

Cloud Functions (`functions/index.js`):
- Trigger:
  - `users/{userId}/notifications/{notificationId}` onCreate
- Zweck:
  - FCM Web Push an `users/{uid}/devices` Tokens
  - Invalid tokens automatisch deaktivieren
- Relevante Env-Optionen:
  - `MENYRA_PUSH_TITLE`
  - `MENYRA_SOCIAL_URL`

## 6) Fotos/Bilder Pipeline
Bild-Upload Flow:
1. Datei-Validierung im Client (`max 15MB`, nur `image/*`)
2. Client-Kompression via `compressImage(...)`
3. Upload zu `${BUNNY_EDGE_BASE}/image/upload` (FormData)
4. Antwort mit `url` und `cdnUrl`
5. `cdnUrl` wird in Firestore-Felder geschrieben (Avatar, Logo, Post, Menu)

Dateien:
- `apps/menyra-social/_shared/image-compressor.js`
- `apps/menyra-social/_shared/image-resolver.js`
- `shared/bunny-edge.js`

Rendering:
- `getOptimizedImageUrl(...)` normalisiert Firebase/GS/CDN Pfade.
- Placeholder/Fallback fuer defekte oder leere Bilder.

## 7) Push und Notification Deep-Link
Frontend:
- App-SW: `apps/menyra-social/sw.js` (App-Scope)
- PWA-Register: `apps/menyra-social/pwa.js`
- Push click sendet `OPEN_NOTIFICATION_TARGET` an geoeffneten Social-Client oder navigiert direkt.

Backend:
- Cloud Function erstellt WebPush Payload + Link mit `notif` Query.
- Device Token Pflege in `users/{uid}/devices`.

## 8) Safe Area, iOS/Safari, PWA
Safe Area Basis:
- CSS Variablen:
  - `--safe-area-top/right/bottom/left`
- Fuellung aus:
  - `env(safe-area-inset-*)`
  - `constant(safe-area-inset-*)` (legacy fallback)

Wichtiges Verhalten:
- `viewport-fit=cover` ist im `index.html` Viewport-Meta aktiv.
- In normalem Safari bleibt Header absichtlich mit normalem Top-Spacing (`.app-header-safe`), um Browser-Chrome sauber zu respektieren.
- In standalone/PWA wird zusaetzlicher Safe-Area-Top/Bottom Padding aktiviert.

## 9) Stabilitaet und Performance-Strategie
Bereits umgesetzt:
- Schrittweise Modul-Auslagerung aus `social-app.js` nach `apps/menyra-social/core/`.
- Lazy-Laden fuer CRM Renderer (`_shared/crm-lazy-renderers.js`).
- Auth-Bootstrap Snapshot Utilities.
- Route-Open/Push-Open Flows als eigene Core-Utilities.
- Lokale Caches fuer Feed, Avatar/Logo, Notifications, Following, Cart, Chat Index.
- Nicht-blockierende Scheduler (`idle` + `microtask`) als zentrale Utilities.

Technische Leitlinien:
- Kleine, reversible Commits.
- Keine behavior hacks; immer gleiche Logik wie restliche App.
- Regression-Schutz durch isolierte Refactors.

## 10) Projektstruktur
Top-Level:
- `apps/menyra-social/` Haupt-App
- `apps/menyra-social/core/` modulare Business-Logik Utilities
  - Themenordner (aktuell): `app-events/`, `auth/`, `chat/`, `common/`, `crm/`, `feed/`, `follow/`, `leads/`, `map/`, `media/`, `menu/`, `notifications/`, `orders/`, `overlays/`, `profile/`, `push/`, `shop/`, `ui/`
- `apps/menyra-social/_shared/` shared Browser-Utilities
- `shared/` globale shared Konfig/Styles
- `functions/` Firebase Cloud Functions
- `hub/` internes Test-Hub UI
- `index.html` Root-Weiterleitung auf Social

Struktur-Konvention (laufend):
- Neue Core-Dateien werden thematisch in Sub-Ordnern angelegt.
- Bestehende Root-Core-Dateien werden schrittweise in passende Ordner verschoben (reversible Commits).

## 11) Lokaler Start
Voraussetzungen:
- Statischer Webserver
- Zugriff auf Firebase Projekt (falls echte Daten noetig)

Start:
1. Repo Root als statischen Server starten.
2. Browser auf `/index.html` oder direkt `/apps/menyra-social/index.html`.
3. Optional Test-Hub: `/hub/`.

## 12) Deployment
Vercel:
- Routing, Redirects, Cache-Header in `vercel.json`.

Firebase Functions:
- Code in `functions/`
- Runtime: Node 20 (`functions/package.json`).

## 13) Refactor-Status (jetzt)
Aktueller Stand:
- `social-app.js`: 16434 Zeilen (orchestrator + verbleibende Dom/Funktionslogik)
- `apps/menyra-social/core/`: 125 Module (inkl. Unterordner)
- `apps/menyra-social/core/` flache Root-Dateien: 0 (vorher >70)
- Aktive Domain-Ordner: `app-events/`, `auth/`, `chat/`, `common/`, `crm/`, `feed/`, `follow/`, `leads/`, `map/`, `media/`, `menu/`, `notifications/`, `orders/`, `overlays/`, `profile/`, `push/`, `shop/`, `ui/`
- Letzte Refactor-Commits:
  - `cc94e5c` `normalizeMenuItemDoc` aus `social-app.js` nach `core/menu/menu-doc-normalize-utils.js` ausgelagert
  - `721de76` Passthrough-Wrapper in `social-app.js` durch Core-Import-Aliase ersetzt
  - `4e10d58` Restliche Root-Utilities in Domain-Unterordner verschoben
  - `f5748c1` Auth/Chat/Push/Notifications/Leads/CRM/App-Events gruppiert
  - `d5802e8` CRM Shared Renderer ausgelagert
  - `ac8ab27` Main Shell + Notifications Renderer ausgelagert
  - `9088e6c` Overlay Root/UI + MenuDetail Update-Logik ausgelagert
  - `33814bb` Post-Modal Update-Logik ausgelagert
  - `4a81672` Comment-Renderer ausgelagert

Zielbild:
- `social-app.js` wird weiter auf Orchestrierung + Event-Wiring reduziert.
- Feature-Logik (feed/chat/shop/crm/push/profile/map) liegt modular in `core/`.
- Naechster Schwerpunkt: weitere Auslagerung aus `social-app.js` in Feature-Orchestratoren pro Domain.

README-Pflege:
- Der Refactor-Status in dieser README wird nach jedem groesseren Refactor-Block aktualisiert.

## 14) Definition of Done (final)
Ein finaler "fertig" Zustand bedeutet:
1. Weitere Splits fuer Feed/Shop/Profile/Map abgeschlossen.
2. Dead Code und ungenutzte Legacy-Pfade entfernt.
3. Smoke/Regression Durchlauf fuer:
   - Safari iOS (Browser + PWA)
   - Samsung Internet / Chrome Android
   - Desktop Chrome/Safari
4. Keine bekannten Blocker bei:
   - Push open-target routing
   - Chat scroll/focus
   - Shop tap-vs-scroll behavior
   - Safe area header/footer behavior
