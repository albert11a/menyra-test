# MENYRA Launch Closure Plan

Stand: 2026-03-31
Basis: `MENYRA_SYSTEM_KERNANALYSE_2026-03-30.md` plus Repo-Stand im aktuellen Workspace

## 1. Ziel

Dieser Plan ist kein weiterer Analyse-Text.
Er ist die konkrete Reihenfolge, in der wir die offenen Launch-Blocker sauber schliessen.

Abgeschlossen ist die Arbeit erst dann, wenn:

- kein Client mehr fremde Notification-Dokumente erzeugen kann
- Restaurants, Menue, Orders und Posts jeweils eine klare kanonische Wahrheit haben
- Gast-, User-, Business- und Waiter-Flows dieselbe operative Wahrheit sehen
- kritische Nutzerpfade auf Cold-Start und unter schwachem Netz innerhalb definierter Zeitbudgets bleiben
- Vendor-, CDN- oder Karten-Ausfaelle zu ehrlichen degradierten Zustanden fuehren statt zu komischen Zwischenwelten
- Cold-Start, QR, Push, Chat und Order-Status unter realen Browserlaeufen reproduzierbar getestet sind
- es ein echtes Release-Gate gibt, das vor jedem Launch gruen sein muss

## 2. Arbeitsregeln

Diese Regeln gelten fuer alle folgenden Schritte:

1. Keine neuen Features, kein UI-Polish, keine SEO- oder Marketing-Arbeit, bis alle P1-Themen geschlossen sind.
2. Jede Domain bekommt genau eine kanonische Quelle und hoechstens abgeleitete Read-Modelle.
3. "Publish on read" wird entfernt. Ableitungen entstehen nur beim Write oder in expliziten Backfills.
4. Placeholder duerfen schnell sein, aber niemals eine andere Wahrheit vorspiegeln.
5. Jede Phase endet mit:
   - Code-Check
   - gezieltem Journey-Test
   - kurzer Doku-Aktualisierung
6. Keine grosse Parallel-Baustelle ohne vorherigen Datenvertrag. Erst Vertrag, dann Umbau.
7. Jede Wahrheitsumstellung bekommt vor dem Merge einen Backfill-, Cutover- und Rollback-Plan.
8. Jede kritische externe Laufzeitabhaengigkeit braucht entweder Self-Hosting oder einen definierten Degraded-Mode.

## 3. Abschlussdefinition pro Problemklasse

### A. Security / Push

- Regel fuer `/users/{userId}/notifications` erlaubt kein Schreiben in fremde User-Pfade durch normale Clients.
- Notification-Erzeugung fuer Chat, Likes, Follow, Orders ist serverautoritativ.
- Push wird nur aus validierten, legitimen Notification-Events versendet.

### B. Single Truth

- Restaurants: eine kanonische Business-Identitaet
- Menue: eine Authoring-Quelle und ein klar definiertes Public-Read-Model
- Orders: eine kanonische Order plus saubere Mirrors
- Posts: ein kanonischer Inhaltsdatensatz plus abgeleitete Feed-Summaries

### C. Honest UX

- keine erfundenen Geo-Koordinaten
- kein QR-Verhalten aus impliziter URL-Deutung
- kein "gesendet", wenn Chat remote gescheitert ist
- kein Guest-Cart unter globalem Browser-Guest-Key

### D. Release Readiness

- konfigurierte Journey-Packs statt `warning/not_configured`
- zentrale Fehlererfassung mit auswertbarem Ablauf
- definierte Launch-Checkliste mit echten Persona-Flows

### E. Performance / Degraded Mode

- definierte Zeitbudgets fuer Cold-Start, Profil, Menue, Cart, Chat und Waiter-Orders
- keine Full-App-Repaint-Kaskade auf jedem kleinen Hot-Path-State-Update
- ehrliche Fallbacks bei Ausfall von Bootstrap, Karten, Medien, Push, Fonts oder Icon-CDNs

## 4. Reihenfolge

## Phase 0 - Freeze, Baseline, Vertrage

Ziel:
Bevor wir umbauen, legen wir die verbindlichen Wahrheitsvertraege fest.

Arbeit:

- Feature-Freeze fuer `apps/menyra-social`, `apps/waiter`, `functions`, `firestore.rules`
- fuer jede P1/P2-Domain ein kurzes Contract-Dokument anlegen:
  - kanonische Quelle
  - erlaubte Read-Modelle
  - Write-Pfad
  - Reconcile-Regeln
  - DoD
- fuer jede Truth-Umstellung ein Migrationsblatt anlegen:
  - Backfill-Quelle
  - Zielschema
  - Cutover-Kriterium
  - Rollback-Regel
  - Verifikationsquery
- Testdaten und Persona-Accounts festziehen:
  - Gast
  - Signed-in User
  - Business Owner
  - Waiter
  - CEO/Test
- Heart-Runner so vorbereiten, dass mindestens `smoke`, `guest-pack`, `user-pack`, `business-pack`, `staff-pack` lokal und gegen Staging wirklich laufen koennen

Betroffene Dateien zuerst:

- `MENYRA_SYSTEM_KERNANALYSE_2026-03-30.md`
- `tests/mnyra-heart-runner/package.json`
- vorhandene Pack-Konfigurationen unter `tests/mnyra-heart-runner`

Abnahme:

- alle Folgephasen haben vorab einen klaren Datenvertrag
- Testpersona-Zugaenge und Zielumgebung sind dokumentiert

## Phase 1 - Notification Security Hotfix

Ziel:
Den unmittelbar ausnutzbaren Push- und Trust-Bruch schliessen.

Arbeit:

1. `firestore.rules` fuer `/users/{userId}/notifications` so haerten, dass normale Clients nur noch im eigenen Pfad lesen und nicht fremde Zielpfade beschreiben koennen.
2. Direkte Client-Schreibpfade pruefen und entfernen:
   - `notification-support-runtime-controller.js`
   - `chat-runtime-controller.js`
   - `social-engagement-runtime-controller.js`
3. Serverseitigen Notification-Writer einfuehren oder bestehenden Flow dorthin migrieren:
   - Callable/HTTP/trigger in `functions/index.js`
   - Validierung von Actor, Target, Type, Ownership
4. `sendWebPushOnNotificationCreate` nur noch auf serverautoritative Events stutzen.
5. Negative Tests einfuehren:
   - User A darf User B keine Notification unterjubeln
   - legitime Chat-/Like-/Order-Notification bleibt intakt

Betroffene Dateien:

- `firestore.rules`
- `functions/index.js`
- `apps/menyra-social/core/notifications/notification-support-runtime-controller.js`
- `apps/menyra-social/core/chat/chat-runtime-controller.js`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`

Abnahme:

- Fremdschreibversuch scheitert reproduzierbar
- legitime Notifications erzeugen weiter Push
- keine direkte Client-Write-Abhaengigkeit mehr fuer fremde User-Pfade

## Phase 2 - Restaurant Identity und Geo Truth

Ziel:
Business-Identitaet und Standortwahrheit zentralisieren.

Entscheidung:

- `restaurants/{rid}` ist die kanonische Business-Quelle.
- Bootstrap ist nur ein fruehes Preview-Read-Model, nie die kanonische Wahrheit.
- `state.restaurants` darf nur kanonisch reconciled Daten enthalten.

Arbeit:

1. `applyPublicBootstrapPayload` so umbauen, dass Bootstrap-Daten als `preview` oder `partial` markiert werden und nie ungeprueft kanonisch werden.
2. `loadRestaurants` fuer alle relevanten Pfade vereinheitlichen, nicht nur tab-abhaengig.
3. `restaurant-identity-runtime-controller.js` auf echten Versions-/UpdatedAt-Abgleich umbauen statt `id|name|logo`.
4. Live-Meta-Listener entweder sauber aktivieren oder bewusst entfernen und durch klaren Refresh-Vertrag ersetzen.
5. Discovery-/Geo-Fallbacks haerten:
   - keine erfundenen Default-Koordinaten
   - unbekannte Koordinaten explizit als unbekannt markieren
   - Suchtreffer ohne valide Koordinaten nicht still auf die Karte setzen
6. UI fuer unbekannte Lage ehrlich machen:
   - kein falscher Marker
   - stattdessen "Standort nicht verifiziert" oder kein Kartenpunkt

Betroffene Dateien:

- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `apps/menyra-social/core/discovery/geo-coord-utils.js`
- `apps/menyra-social/social-app.js`

Abnahme:

- Cold-Start, Feed, Profil und Discovery zeigen dieselbe Business-Identitaet
- Stadt/Geo springen nicht zwischen Bootstrap und Voll-Load
- fehlende Koordinaten fuehren nie zu erfundenen Orten

## Phase 3 - Menu and QR Contract

Ziel:
Menue und QR aus der hybriden Mehrfach-Wahrheit holen.

Entscheidung:

- Eine Authoring-Quelle bleibt editierbar.
- Ein Public-Read-Model wird daraus erzeugt.
- Der Public-Client liest nur das Public-Read-Model.
- QR ist ein expliziter Kontext, kein erratener Nebeneffekt.

Empfohlener Vertrag:

- Authoring: `restaurants/{rid}/menuItems`
- Public Read Model: `restaurants/{rid}/public/menu`

Arbeit:

1. `loadMenuHybrid` entfernen oder auf Migrationsmodus begrenzen.
2. `publishMenuToPublic` nur noch bei Business-Write oder explizitem Backfill ausfuehren, nie beim ersten Gast-Lesen.
3. `renderProfileMenuView` auf einen klaren Menu-Load-Vertrag umstellen:
   - Profil oeffnet mit Loading/Skeleton
   - danach einheitlicher Menuezustand
4. Deeplink-Vertrag schaerfen:
   - `?tab=menu` bedeutet Profil-Menue
   - QR bekommt expliziten Marker wie `source=qr` oder eigenem Pfad
5. QR-Aktionswahl in `menu-modal-render-utils.js` nur noch aus explizitem QR-Kontext ableiten.
6. Migrationsskript oder Backfill fuer bestehende Legacy-Menues bauen.

Betroffene Dateien:

- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/qr/table-qr-runtime-controller.js`
- `apps/menyra-social/core/menu/menu-modal-render-utils.js`
- `apps/menyra-social/core/deeplink/deeplink-flow-utils.js`
- `functions/index.js`

Abnahme:

- Menue kommt fuer Gast, User und QR aus derselben Public-Wahrheit
- erstes Gast-Lesen publiziert nichts mehr
- source-loser Menu-Link fuehrt nie mehr in QR-Semantik

## Phase 4 - Orders Mirror und Waiter Runtime

Ziel:
Eine operative Order-Wahrheit plus saubere Projektionen fuer User, Guest und Waiter.

Entscheidung:

- Kanonische Order: `restaurants/{rid}/orders/{orderId}`
- User-Orders: serverseitig gespiegeltes Read-Model unter `users/{uid}/orders/{orderId}`
- Guest-Orders: lookup-faehige Quittung ueber Gast-Session oder Order-Token, nicht nur lokales RAM

Arbeit:

1. `submitShopCheckout` so umbauen, dass immer zuerst die kanonische Restaurant-Order entsteht.
2. Mirror-Logik aus dem Client ziehen und serverseitig in `functions/index.js` verwalten.
3. Waiter-Statusaenderungen nur auf der kanonischen Order erlauben; Mirror-Status serverseitig nachziehen.
4. Guest-Order-Recovery einfuehren:
   - Guest-Session-ID oder Order-Lookup-Token
   - Restore nach Reload
5. `waiter-app.js` Push-Handling korrigieren:
   - kein unbeabsichtigtes `disableWaiterPushDevices` beim erfolgreichen Login
   - Service Worker zeigt echte Order-Pushes
6. Firestore-Rules auf diese Wahrheitskette anpassen.

Betroffene Dateien:

- `apps/menyra-social/core/orders/orders-runtime-controller.js`
- `apps/waiter/waiter-app.js`
- `apps/waiter/sw.js`
- `functions/index.js`
- `firestore.rules`

Abnahme:

- Waiter, Business, User und Guest sehen nach Statuswechsel dieselbe Order-Realitaet
- Guest-Order ist nach Reload wieder auffindbar
- Waiter-Push funktioniert reproduzierbar

## Phase 5 - Post, Feed, Profil, Story, Chat Recovery

Ziel:
Die verbleibenden Mehrfach-Wahrheiten in Content- und Kommunikationspfaden reduzieren.

Entscheidung:

- Kanonischer Post-Inhalt lebt im eigentlichen Post-Dokument.
- Feed-Eintraege sind nur abgeleitete Summaries.
- Profile, Modals und Feed muessen aus derselben Inhaltsquelle reconciled werden.

Arbeit:

1. Post-Vertrag festziehen:
   - Vollinhalt unter `restaurants/.../socialPosts`
   - Summary im Feed nur als Projection
2. `patchFeedList` so aendern, dass Inhaltsaenderungen nicht auf Counts begrenzt bleiben.
3. `findPostById` und `updatePostCaches` auf einen zentralen Reconcile-Pfad bringen.
4. Profil-Open-Flows ehrlicher machen:
   - Skeleton oder neutraler Loading-State
   - keine Placeholders, die wie echte Profilwahrheit aussehen
5. Story-Vertrag festziehen:
   - echte Stories bleiben echte Stories
   - Feed-basierte Ersatzstorys, falls behalten, klar getrennt als Fallback-UI und nicht als dieselbe Wahrheit
6. Chat auf harte Remote-Recovery umbauen:
   - lokaler Status `pending`
   - bei Remote-Fehler `failed`
   - Retry-Pfad sichtbar

Betroffene Dateien:

- `apps/menyra-social/core/media/media-upload-runtime-controller.js`
- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
- `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `apps/menyra-social/core/stories/story-feed-runtime-controller.js`
- `apps/menyra-social/core/stories/story-viewer-runtime-controller.js`
- `apps/menyra-social/core/chat/chat-runtime-controller.js`

Abnahme:

- Feed, Profil und Modal zeigen nach Inhaltsaenderung denselben Post
- Business-Profil startet nicht mehr mit irrefuehrender Ersatzwahrheit
- Chat kennt sichtbaren Failed-State

## Phase 6 - Guest Scoping

Ziel:
Gastzustand von browserweit geteilter Pseudowahrheit auf besucherbezogene Wahrheit umstellen.

Arbeit:

1. Festen `GUEST_SCOPE_UID` durch echte Guest-Session-ID ersetzen.
2. Guest-Cart, Guest-Order-Hinweise und Guest-Persistenz an diese Session binden.
3. Checkout darf Guest-Zustand nicht nur lokal pushen, sondern muss eine Wiederherstellung erlauben.
4. Tab- und Session-Guards fuer Guest-Pfade auf neuen Scope anpassen.

Betroffene Dateien:

- `apps/menyra-social/core/storage/social-storage.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/session/session-tab-guards.js`
- `apps/menyra-social/core/orders/orders-runtime-controller.js`

Abnahme:

- neuer Gast bekommt nie Cart-Daten vom vorherigen Besucher
- Guest-Order und Cart sind nach Reload konsistent

## Phase 7 - Render Budget, Vendor Hardening und Degraded Modes

Ziel:
Die App soll nicht nur korrekt, sondern auch fuer echte Kunden schnell, ruhig und ausfalltolerant wirken.

Arbeit:

1. Messbare Performance-Budgets definieren:
   - Cold Guest Landing
   - Profil oeffnen
   - Menue oeffnen
   - Add to Cart
   - Chat senden
   - Waiter Order Refresh
2. Vorhandene Warm-/Fast-Heuristiken durch echte Messung ergaenzen:
   - `performance.mark` und `performance.measure`
   - Heart-Artefakte fuer Timing und Netzprofil
   - kein "warm visit" als alleiniger Beweis fuer Schnelligkeit
3. Hot Paths von der globalen Full-App-Renderkette entkoppeln:
   - `setState -> render -> appEl.innerHTML` fuer kritische Interaktionen reduzieren
   - Feed, Profil, Menue, Cart, Chat, Notifications und Waiter-Orders gezielt isolieren
4. Kritische Vendor-Abhaengigkeiten haerten:
   - Firebase Web SDK
   - Lucide ohne `latest`
   - Waiter ohne Tailwind-CDN zur Laufzeit
   - Leaflet und Karten-Assets
   - Fonts und Media-Edge
5. Degraded-Mode-Vertraege definieren und umsetzen:
   - Bootstrap-Endpoint down
   - Kartenbibliothek oder Tile-Provider down
   - Media-Edge down
   - Push unsupported oder Push-Service down
   - Icon- oder Font-CDN down
6. Service-Worker- und Cache-Strategien auf diese Vertraege abstimmen:
   - keine still stale Runtime aus gemischten Quellen
   - saubere Versionierung
   - gleiche Regeln fuer Social und Waiter
7. Heart-Packs um Performance- und Degrade-Szenarien erweitern:
   - Slow 3G
   - Fast 4G
   - Blocked vendor host
   - Reload nach SW-Update

Betroffene Dateien:

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
- `tests/mnyra-heart-runner`

Abnahme:

- definierte Hot Paths bleiben im Zielbudget auf echten Testprofilen
- Vendor-Ausfall fuehrt zu ehrlicher, stabiler Fallback-UI statt zu still falschen Zwischenzustanden
- Social und Waiter laden keine kritischen Laufzeitteile mehr ausschliesslich ueber fragile `latest`- oder CDN-only-Pfade

## Phase 8 - Release Gates und Observability

Ziel:
Aus dem Blindflug einen echten Launch-Prozess machen.

Arbeit:

1. Minimale Pflicht-Gates einziehen:
   - `node --check` fuer Runtime-Dateien
   - Firestore-Rules-Tests
   - Functions-Syntax und zielgerichtete Integrationstests
   - Heart-Journey-Packs mit echter Konfiguration
2. Pflicht-Journeys definieren:
   - Cold Guest Landing
   - Guest QR -> Menu -> Cart -> Order
   - Signed-in User Chat + Notification
   - Business Menu Edit -> Public View
   - Waiter receives order -> status update
   - Business post edit -> Feed/Profile reflect change
3. Slow-Network-Profile einfuehren:
   - Fast 4G
   - Slow 3G
   - Offline/Recover fuer SW-relevante Wege
4. Client-Fehler nicht nur lokal puffern, sondern zentral auswertbar machen.
5. Launch-Checkliste festziehen:
   - was vor Deploy gruen sein muss
   - wer signoff gibt
   - wie Rollback aussieht

Betroffene Dateien:

- `tests/mnyra-heart-runner/package.json`
- Runner-Konfigurationen unter `tests/mnyra-heart-runner`
- `shared/runtime-error-reporter.js`
- `functions/package.json`
- `shared/package.json`

Abnahme:

- `smoke` und relevante Persona-Packs liefern nicht mehr `warning/not_configured`
- jeder P1-Flow ist automatisiert oder mit klarem manuellen Gate abgedeckt
- Fehler koennen nach Session und Persona ausgewertet werden

## 5. Konkrete Batch-Reihenfolge

Wenn wir das ohne Chaos abschliessen wollen, ist diese Reihenfolge sinnvoll:

1. Batch A: Phase 0 Contracts + Freeze + Testbaseline
2. Batch B: Phase 1 Notification Security Hotfix
3. Batch C: Phase 2 Restaurant Identity + Geo Truth
4. Batch D: Phase 3 Menu + QR Contract
5. Batch E: Phase 4 Orders Mirror + Waiter Push
6. Batch F: Phase 5 Post/Feed/Profile/Story/Chat Recovery
7. Batch G: Phase 6 Guest Scoping
8. Batch H: Phase 7 Render Budget + Vendor Hardening
9. Batch I: Phase 8 Release Gates + Observability
10. Batch J: Full regression pass, bugfix-only, launch signoff

## 6. Was parallel laufen darf

Parallel nur dort, wo die Wahrheit nicht kollidiert:

- Waehrend Batch B laeuft, kann jemand die Contract-Dokumente aus Phase 0 fertigziehen.
- Waehrend Batch C laeuft, kann jemand die Testpacks fuer Phase 8 konfigurieren.
- Batch D und Batch E duerfen nicht gleichzeitig ohne klaren Shared-Contract fuer Profil/QR/Checkout laufen.
- Batch F erst starten, wenn Restaurant-, Menue- und Order-Vertraege stabil sind.
- Batch H darf erst starten, wenn die grossen Wahrheitsumstellungen stabil und migriert sind.

## 7. Definition of Done fuer den Gesamtabschluss

Das Projekt ist erst dann wirklich "abgeschlossen", wenn alle folgenden Punkte gleichzeitig stimmen:

- kein offener P1-Befund mehr
- kein bekannter Fremd-Notification-Write moeglich
- keine erfundenen Kartenpositionen mehr
- Menue und QR folgen demselben expliziten Vertrag
- Order-Status driftet nicht zwischen Waiter, User und Guest
- Post-Inhalt driftet nicht zwischen Feed, Profil und Modal
- Chat kann sichtbare Remote-Fehler darstellen
- Guest-Zustand ist besucherbezogen
- kritische Hot Paths halten die vereinbarten Zeitbudgets
- Vendor- oder Karten-Ausfall fuehrt nicht zu still falscher oder kaputter UI
- relevante Journey-Packs laufen gruen oder mit bewusst dokumentierten Rest-Risiken

## 8. Empfohlener Start ab jetzt

Nicht mit Feed oder UI anfangen.
Der erste echte Arbeitsblock ab jetzt sollte sein:

1. Phase 0 als kurzer Contract-Sprint
2. sofort danach Phase 1 Notification Security Hotfix
3. dann Phase 2 Restaurant Identity + Geo Truth

Erst wenn diese drei Teile stehen, lohnt sich der Rest wirklich.
