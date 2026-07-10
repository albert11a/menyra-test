Status: CURRENT
Stand: 2026-07-08

# Mnyra Analytics System

Vollstaendiges Analytics-System fuer Businesses (Mnyra Menu) und CEO/Admin (Heart).

## 1. Plan / Analyse

### Relevante bestehende Dateien und Datenmodelle

- Businesses: `restaurants/{restaurantId}` (Owner via `ownerUid`/Owner-Mail-Felder),
  Profil-/Menu-Rendering in `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`.
- Beitraege: `restaurants/{rid}/socialPosts`, `restaurants/{rid}/menuSocial`, `socialFeed`,
  Feed-Rendering in `core/feed/feed-view-orchestration-controller.js`
  (`data-feed-post-open`, `data-feed-post-like`, `data-open-post`).
- Menu/Produkte: `restaurants/{rid}/menuItems`, Public-Menu-Runtime
  (`core/menu/menu-public-runtime-controller.js`), Produkt-Detail via `state.menuDetail`.
- QR: Query-Keys `source|menuSource|menuAccessSource=qr` + `table|tableNumber|t`,
  Tisch-QR-Konfiguration in `core/menu/table-qr-runtime-controller.js`.
- Bestellungen: `core/orders/orders-runtime-controller.js` (`submitShopCheckout`),
  Cloud Function `createRestaurantOrder`, Collection `restaurants/{rid}/orders`.
- Call-Waiter: Header-Button `data-action="kellner"` (`core/app-shell/app-shell-runtime-controller.js`).
- Rollen: CEO via `shared/ceo-access.js` / `isCeoActor()` in `firestore.rules`;
  Business-Zugriff via `hasRestaurantBusinessAccess()`.
- Heart: Store/Render/Events in `apps/mnyra-heart/heart-state.js`, `heart-render.js`,
  `heart-events.js`, `heart.js`; liest Firestore direkt (siehe `heart-crm-admin-read-loaders.js`).

### Bestehende Events

Es gab **kein** Event-Tracking-System. Likes/Kommentare existieren als Social-Counter,
aber keine Impressionen, Profilbesuche, QR-Scans oder Conversion-Daten.

### Neue Events (einheitliche Namen)

`business_profile_view`, `profile_contact_click` (phone/address/map/hours/social),
`post_impression`, `post_click`, `post_like`, `post_share`,
`menu_open`, `category_open`, `product_view`, `product_like`,
`qr_scan`, `call_waiter_click`,
`order_started`, `order_completed`,
`feed_impression`, `feed_click`.

Metadaten pro Event: `businessId`, `userId` (falls eingeloggt), `sessionId`, `source`,
`postId`, `productId`, `menuId`, `categoryId`, `tableId`, `value`, `day`, `hour`, `createdAt`.

### Datenbankstruktur

- `restaurants/{rid}/analyticsEvents/{autoId}` – Roh-Events (create-only, Reads nur Owner/Staff/CEO).
- `restaurants/{rid}/analyticsDaily/{YYYY-MM-DD}` – Tages-Aggregat (Increments beim Tracken,
  Dashboard liest max. ~92 Docs pro Zeitraum → schnell und guenstig):

```
{
  date, updatedAt,
  counters:      { <eventName>: n },
  uniques:       { business_profile_view: n, menu_open: n, qr_scan: n },   // Session-dedupliziert
  profileSources:{ feed|restaurants|search|map|qr|external|direct|other: n },
  contacts:      { phone|address|map|hours|social: n },
  hourly:        { "0".."23": { qrScans, waiterCalls, ordersCompleted } },
  posts:         { <postId>:    { impressions, clicks, likes, shares } },
  products:      { <productId>: { views, likes, orders, quantity, revenue, name } },
  categories:    { <catKey>:    { opens, name } },
  tables:        { t<n>:        { qrScans, waiterCalls, ordersCompleted } },
  orders:        { started, completed, revenue, itemCount, qr, external }
}
```

### Doppelzaehlungs-Schutz

- Session-ID in `sessionStorage` (`mnyra_analytics_session_v1`).
- Dedupe-Registry pro Tag+Session (`mnyra_analytics_dedupe_v1`): Impressionen,
  Profil-Uniques, QR-Scans und Feed-Impressionen zaehlen max. 1x pro Session/Tag.
- Zustands-Transitions statt Render-Hooks: ein Re-Render erzeugt keine neuen Events.
- Eigene Ansichten zaehlen nicht: Owner/Staff des gleichen Restaurants und CEO-Profile
  werden uebersprungen.

### Datenschutz

- Businesses sehen nur Aggregate (`analyticsDaily`); Roh-Events enthalten keine
  Namen/E-Mails, nur optionale `userId`.
- Firestore Rules: Reads auf `analyticsEvents`/`analyticsDaily` nur fuer
  Owner/Staff (businessAccess) des Businesses und CEO. Kein Business kann fremde
  Analytics lesen.

## 2. Architektur

Neue Module (alle unter `apps/menyra-social/core/analytics/`):

- `analytics-event-schema.js` – Event-Namen, Sanitizing, Increment-Plaene (pur, getestet).
- `analytics-tracker.js` – Session/Dedupe/Queue/Flush (Batch), DOM-Delegation
  (Klicks + IntersectionObserver-Impressionen), State-Transition-Beobachtung.
  Lazy-Firestore (dynamischer Import), Fehler brechen die App nie.
- `analytics-daily-loader.js` – laedt `analyticsDaily`-Docs per Dokument-ID-Range.
- `analytics-dashboard-core.js` – Zeitraeume, Merge, Vergleich zur Vorperiode,
  Top-Listen, Funnel, Formatierung (pur, getestet).
- `analytics-dashboard-render-utils.js` – KPI-Karten, SVG-Trend-Chart (Crosshair-Tooltip),
  Stunden-Balken, Funnel, Tabellen, Loading/Empty/Error, eigenes scoped CSS
  mit Light/Dark-Variablen (Heart nutzt Dark).
- `analytics-view-controller.js` – Business-Tab-Controller (Mnyra Menu).

Integration Social-App:

- Drawer-Nav-Eintrag `analytics` (nur Business/Staff mit businessAccess),
  Route in `route-runtime-registry.js` + `main-shell-render-utils.js`.
- Tracker-Init + State-Beobachtung in `social-app.js` (ein Hook im `render()`).
- `order_completed` (inkl. Umsatz, Tisch, Items) direkt in
  `orders-runtime-controller.js` nach erfolgreichem Checkout.

Integration Heart:

- Nav-Item `analytics`, State/Actions in `heart-state.js`,
  Adapter `heart-analytics-adapter.js` (Business-Liste + Range-Load),
  View `heart-analytics-render.js` (Business-Auswahl mit Suche),
  Operations/Events in `heart.js` / `heart-events.js`.

## 3. Rollenlogik

- CEO (Heart): waehlt beliebiges Business, sieht alles (`isCeoActor()` in Rules).
- Business (Mnyra Menu): sieht nur `state.userProfile.restaurantId`.
- Gaeste: Tab `analytics` ist fuer Gaeste nicht erreichbar (Session-Guard laesst
  fuer Gaeste nur die Whitelist-Tabs zu); Rules verhindern Reads zusaetzlich.

## 4. Tests

- `tests/analytics-event-schema.test.mjs` – Namen, Sanitizing, Increment-Plaene.
- `tests/analytics-dashboard-core.test.mjs` – Zeitraeume, Merge, Deltas, Top-Listen, Funnel.
- `tests/analytics-tracker-state.test.mjs` – Transition-Erkennung (Profil/Menu/Produkt/
  Checkout), Dedupe, Own-Profile-Skip, Queue-Flush-Gruppierung.

## 5. Deployment der Firestore-Rules (WICHTIG)

- Der Vercel-Auto-Deploy bei Push auf `main` deployt **nur das Frontend**.
  Die in diesem Feature neu hinzugekommenen Rules fuer `analyticsEvents` und
  `analyticsDaily` muessen separat nach Firebase deployt werden, sonst laufen
  alle Reads (Dashboard) und Writes (Tracking) in `permission-denied` und der
  Analytics-Tab zeigt "Analytics konnten nicht geladen werden".
- Manuell: `FIREBASE_SERVICE_ACCOUNT='<sa-json>' node scripts/deploy-firestore-rules.mjs`
  (Admin-SDK-Rules-API; funktioniert mit dem Standard-Service-Account
  `firebase-adminsdk-...@`. `firebase deploy --only firestore:rules` braucht
  dagegen zusaetzliche Service-Usage-Rechte.)
- Automatisch: Workflow `.github/workflows/deploy-firestore-rules.yml` deployt
  bei jeder Aenderung an `firestore.rules` auf `main`. Voraussetzung:
  Repo-Secret `FIREBASE_SERVICE_ACCOUNT` (Service-Account-JSON aus der
  Firebase Console, Projekteinstellungen -> Dienstkonten).
- Rules-Deploy erfolgt am 2026-07-10 erstmalig manuell (vorher war das
  Ruleset vom 2026-06-29 aktiv, ohne Analytics-Regeln).
- Hinweis: Solange die Rules nicht deployt waren, wurden auch keine Events/
  Aggregate geschrieben. Nach dem Rules-Deploy startet die Datensammlung bei
  null; Zahlen erscheinen zuerst unter "Heute".

## 6. Bewusste Grenzen / Naechste Schritte

- Aggregation erfolgt clientseitig via Firestore-Increments (kein neuer
  Functions-Deploy noetig). Ein spaeterer Umzug auf eine Cloud Function
  (Trigger auf `analyticsEvents`) ist ohne Schemaaenderung moeglich.
- `analyticsDaily`-Writes sind fuer anonyme Clients erlaubt (Increment-Spam ist
  theoretisch moeglich, konsistent mit bestehender Client-Write-Posture, siehe
  `SECURITY_FIRESTORE_REPORT.md`). Reads sind strikt geschuetzt.
- Reichweite (unique Nutzer) ist session-basiert approximiert, ohne
  personenbezogene Speicherung.
