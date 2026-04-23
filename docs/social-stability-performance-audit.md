# Social Stability And Performance Audit

Stand: 2026-03-19

## Ziel

Dieses Dokument beschreibt die aktuell relevanten Stabilitaets-, Performance- und Konsistenzprobleme in `menyra-social` und `waiter`.

Es ist bewusst kein Refactor-Entwurf fuer "alles neu", sondern ein kontrollierter Plan, um:

- doppelte Counts und Drift zu beenden
- Erstbesuch und Login spuerbar schneller zu machen
- Render-Jank und Race Conditions zu reduzieren
- den Code bug-resistenter zu machen

## Kurzfazit

Der groesste aktuelle Social-Bug ist nicht mehr ein einzelner offensichtlicher Zaehlfehler, sondern ein strukturelles Problem:

- dieselben Post-Daten leben parallel in mehreren State-Listen und im Modal
- Counts werden lokal optimistisch mutiert, spaeter per Snapshot wieder korrigiert
- normale Ladepfade korrigieren Wert-Aenderungen oft nicht, wenn nur IDs gleich bleiben

Deshalb koennen Like- und vor allem Kommentar-Counts lokal falsch bleiben, bis ein echter kompletter Refresh erfolgt.

Der groesste Performance-Blocker ist aktuell:

- zu viele Render-Zyklen waehrend Startup und Datenhydration
- ein sequentieller Bootstrap-Waterfall
- zu viele Laufzeit-Abhaengigkeiten und Cache-/Hydrate-Pfade fuer den Erstbesuch

## Vollprojekt-Audit fuer SaaS-Betrieb

Diese Zusatzsektion bewertet das Projekt als zahlungspflichtige Plattform fuer laufende Monatsabos.

Zielbild:

- hoher Vertrauensgrad fuer bezahlende Kunden
- schneller Erstbesuch und schnelle Folgeinteraktionen
- moeglichst wenige Betriebsstoerungen
- kontrollierte Releases ohne "geht ploetzlich nicht mehr"

### Was bereits gut ist

1. Firestore-Regeln sind nicht offen

- `firestore.rules` hat einen klaren Default-Deny-Abschluss:
  - `match /{document=**} { allow read, write: if false; }`
- es gibt fuer viele Kernsammlungen bereits rollen- und restaurantbezogene Guards
- das ist deutlich besser als ein typischer frueher Firebase-Stand

2. Es gibt schon echte Domain-Dateien

- `core/chat/*`
- `core/profile/*`
- `core/crm/*`
- `core/menu/*`
- `core/orders/*`
- `core/discovery/*`

Das heisst: das Projekt ist nicht "alles in einer Datei". Die falsche Zentralisierung passiert vor allem noch im Root und in den grossen Koordinationsdateien.

3. Service Worker und App-Versionierung sind schon da

- `apps/menyra-social/sw.js`
- `apps/menyra-social/pwa.js`
- `apps/menyra-social/index.html` nutzt versionierte Query-Token fuer `social-app.js` und CSS

Das ist eine gute Basis fuer kontrollierte Updates.

4. Lokaler Firebase-Cache ist aktiviert

- `shared/firebase-config.js` nutzt `persistentLocalCache(...)`
- Auth-Persistence ist ebenfalls konfiguriert

Das ist positiv fuer Wiederbesuche und Offline-/Schwachnetz-Verhalten.

### Was fuer ein Abo-SaaS aktuell nicht passt

1. Kein sichtbarer automatisierter Frontend-Regressionsschutz

Im Repo ist aktuell kein echter Browser-Testpfad sichtbar fuer:

- Social Hauptflows
- Waiter Hauptflows
- Role-basierte Flows
- Chat
- Leads
- Orders
- Upload

Es gibt zwar `functions/package.json`, aber kein Root-Testsetup fuer die Web-Apps.

Business-Folge:

- jede Aenderung bleibt riskant
- Bugs werden erst beim echten Kundenkontakt sichtbar

2. Produktions-Frontend haengt an externen Laufzeit-CDNs

Belegt durch:

- `apps/menyra-social/index.html`
  - Google Fonts
  - Firebase ESM von `www.gstatic.com`
  - `lucide@latest` von `unpkg`
- `apps/waiter/index.html`
  - `https://cdn.tailwindcss.com`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
  - Leaflet von `unpkg`

Business-Folge:

- Erstbesuch ist abhaengig von Dritt-CDNs
- mehr Varianz bei Ladezeit
- `@latest` ist nicht deterministisch und fuer Produktion unprofessionell

3. Harte Default-Passwoerter im CRM-/Lead-Pfad

Belegt durch:

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/lead*/...`
- `apps/menyra-social/core/crm/crm-runtime-controller.js`

Auffaellig:

- `LEAD_SOCIAL_DEFAULT_PASSWORD = "Alberthoti1992"`

Business-Folge:

- massiver Security- und Vertrauensschaden, falls dieser Pfad produktiv genutzt wird
- nicht akzeptabel fuer zahlende Kunden

4. Monolithische Root-/Coordinator-Dateien bleiben zentrale Ausfallpunkte

Die groessten Produktionsrisiken sitzen aktuell in:

- `apps/menyra-social/social-app.js` (`5582` Zeilen)
- `apps/menyra-social/core/crm/crm-runtime-controller.js` (`2588` Zeilen)
- `apps/menyra-social/core/app-shell/controller-deps-factory.js` (`2083` Zeilen)
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js` (`1655` Zeilen)
- `apps/menyra-social/core/chat/chat-runtime-controller.js` (`1608` Zeilen)

Business-Folge:

- hohe Aenderungsangst
- kleine Bugs koennen grosse Seiteneffekte haben
- Onboarding neuer Entwickler wird langsam und teuer

5. Fehlerbehandlung ist breit verteilt, aber Monitoring nicht sichtbar

Es gibt viele `console.error(...)`-Stellen und lokale Fehlerabfaenge, aber kein sichtbares produktives Fehler-Monitoring wie:

- Sentry
- Bugsnag
- Datadog RUM
- vergleichbare Frontend-Fehlererfassung

Business-Folge:

- du erfaehrst von echten Kundenbugs zu spaet
- Fehler werden nicht systematisch gruppiert oder priorisiert

6. Externe Geocoder/Map-Services sind zur Laufzeit kritisch

Belegt durch:

- `apps/menyra-social/core/crm/crm-runtime-controller.js`
- `apps/menyra-social/core/map/plus-code-utils.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`

Auffaellig:

- Nominatim-Requests direkt aus dem Client
- Leaflet/Carto extern

Business-Folge:

- schwankende Antwortzeiten
- moegliche Rate-Limits
- discovery / lead edit / location picker sind dadurch stoeranfaellig

### Was architektonisch der groesste Business-Hebel ist

1. `social-app.js` ist kein Kernel

Das ist der wichtigste strukturelle Hebel. Solange dort zu viel Ownership lebt, bleiben:

- Speed schwer optimierbar
- Fehler schwer isolierbar
- Releases riskant

2. `socialEngagementSupportRuntimeController` ist zu breit

Hier haengen mehrere Themen zusammen, die fuer stabile Counts und Modal-Konsistenz sauber getrennt werden muessen.

3. Chat haengt noch zu direkt im Startup

Das verletzt dein Ziel `Auth + Feed` only strict core path und kostet Startup-Zeit.

4. CRM ist funktional stark, aber operativ riskant

Die CRM-Flaeche ist gross und direkt umsatzrelevant. Genau dort duerfen keine halben Refactors oder impliziten Legacy-Pfade bleiben.

## Was fuer dein Ziel "extrem schnell" realistisch ist

Du willst ein Verhalten wie grosse Commerce-Plattformen: sehr schneller First Meaningful View, schnelle Folgeinteraktionen, stabile Navigation.

Das ist erreichbar, aber nicht durch "einfach nur Server schneller".

Dafuer brauchst du in dieser Codebasis konkret:

1. sehr kleinen Strict-Startup
- nur Auth + Feed

2. keine Nicht-Core-Runtimes im Start
- kein Chat
- kein schweres Profile/Menu/Focus
- kein CRM
- kein Discovery

3. deterministische statische Assets
- kein `lucide@latest`
- kein Tailwind-CDN im Produktionspfad
- Leaflet nicht dynamisch von `unpkg`

4. kontrollierte Render-Wellen
- weniger direkte `render()`-Streuung
- mehr Scheduler-/Batching-Regeln

5. klare Domain-Ownership
- damit Features schneller geladen und sicherer geaendert werden koennen

## Was ich fuer dein Business als Prioritaet setze

### Prioritaet 0: Security und Betriebsvertrauen

Sofort angehen:

- hartcodiertes Lead-Default-Passwort entfernen
- Passwort-Erzeugung / Invite-Flow sauber machen
- echtes Fehler-Monitoring einfuehren
- Smoke-Test-Matrix fuer kritische Kundenpfade aufbauen

### Prioritaet 1: Release-Sicherheit

Vor jedem groesseren Refactor:

- Browser-Smoke-Tests fuer:
  - Login
  - Feed
  - Profile
  - Chat
  - Leads edit
  - Orders
  - Upload
  - Search/Map

Ohne das ist jede Architekturverbesserung weiter betriebsriskant.

### Prioritaet 2: Startup-Speed

Dann:

- Chat aus Strict-Startup entfernen
- Profile/Menu/Focus aus Root-Komposition ziehen
- runtime-CDN-Abhaengigkeiten reduzieren

### Prioritaet 3: Root-Demotion

Dann:

- `social-app.js` -> echter Kernel
- `controller-deps-factory.js` splitten
- `app-controller-bridge.js` splitten

### Prioritaet 4: Datenkonsistenz

Dann:

- Post-Counts und Comment-Counts auf Single Source Of Truth bringen
- loader reconciliation verbessern
- Modal-/Feed-/Profile-Kopien reduzieren

## Was ich dir nicht behaupte

Ich habe in diesem Schritt:

- keine Lighthouse-Messung gefahren
- keine synthetischen Web-Vitals gemessen
- keinen echten Browser-Loadtest ausgefuehrt
- keine Lasttests gegen Firebase/Functions gefahren

Deshalb behaupte ich keine erfundenen Millisekundenwerte.

Diese Audit ist codebasiert und dateibasiert, nicht geraten.

## Bestaetigte Findings

### 1. Post-Counts haben keine echte Single Source Of Truth

Betroffene Stellen:

- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:307`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:332`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:341`

Aktuelles Muster:

- derselbe Post kann gleichzeitig in `state.feedPosts`, `state.userPosts`, `state.businessPosts`, `state.profileView.posts`, `state.profileModal.profile.posts` und `state.postModal.post` leben
- `collectPostCountTargets()` und `applyPostCounts()` versuchen diese verteilten Objekte spaeter wieder zu synchronisieren
- dadurch wird Konsistenz nicht garantiert, sondern nachtraeglich "zusammengeflickt"

Auswirkung:

- lokale Drift
- schwer reproduzierbare Double-Count-Zustaende
- komplizierte Fixes an einzelnen Stellen helfen nur teilweise

### 2. Kommentar-Count wird gleichzeitig ueber Remote-Write, Snapshot und lokale State-Mutation beeinflusst

Betroffene Stellen:

- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:371`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:420`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:426`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:453`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:816`

Aktuelles Muster:

- `addComment()` schreibt `commentsCount` remote hoch
- danach wird lokal `updatePostCounts(... skipRemote: true ...)` ausgefuehrt
- parallel aktualisiert ein Snapshot-Listener denselben Count aus Firestore

Wichtig:

- der offensichtliche doppelte Inkrement-Bug wurde schon reduziert
- das Problem ist aber strukturell noch nicht sauber geloest, weil der Basiswert weiter aus einem lokal mutierbaren Objekt kommt

Auswirkung:

- Kommentar-Counts koennen lokal kurz oder dauerhaft falsch sein
- die Abweichung bleibt oft stehen, bis ein kompletter Reload alles neu normalisiert

### 3. Feed-, User- und Business-Post-Loader korrigieren Wert-Aenderungen nicht, wenn die ID-Liste gleich bleibt

Betroffene Stellen:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:686`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:747`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:807`

Aktuelles Muster:

- `loadFeedPosts()`, `loadUserPosts()` und `loadBusinessPosts()` vergleichen am Ende nur die Post-IDs
- wenn `prevIds === nextIds`, wird oft nicht weiter reconciled
- geaenderte Counts, Texte, Logos oder andere Werte koennen dadurch lokal veraltet bleiben

Auswirkung:

- falsche Counts heilen nicht von selbst
- ein echter kompletter Refresh wirkt "magisch korrekt", weil dann alles neu aufgebaut wird
- genau deshalb fallen lokale Count-Bugs bis zum Refresh so stark auf

Das ist aktuell einer der wichtigsten verstaerkenden Faktoren fuer den Kommentar-Bug.

### 4. Startup produziert viele Render-Wellen

Betroffene Stellen:

- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`

Hinweise:

- `render()` wird im Startup mehrfach hintereinander in verschiedenen Phasen getriggert
- `loadPersisted()`, Guest-Hydration, Feed-Hydration, Restaurant-Hydration, Auth-Bootstrap und Tab-Ensure koennen jeweils eigene Render-Wellen ausloesen
- `session-data-runtime-controller.js` ruft an sehr vielen Stellen direkt `renderFn()` auf

Auswirkung:

- sichtbares Nachladen
- UI wirkt weniger "instant"
- erhoehtes Risiko fuer Zwischenzustaende

### 5. Auth-Bootstrap hat weiterhin einen sequentiellen Wasserfall

Betroffene Stelle:

- `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js`

Aktuelles Muster:

- `loadProfile(user)` wird abgewartet
- danach `hydrateRestaurants([restaurantId])`
- danach `resolveRoles(user)`
- erst danach laufen weitere Schritte non-blocking

Auswirkung:

- Login ist stabiler als vorher, aber nicht so schnell wie moeglich
- auf mobilem Netz kostet dieser serielle Pfad merklich Zeit

### 6. Erstbesuch hat unnötige Laufzeit-Abhaengigkeiten

Betroffene Stellen:

- `apps/menyra-social/index.html`
- `apps/waiter/index.html`

Auffaellig:

- `lucide@latest` wird zur Laufzeit von `unpkg` geladen
- `waiter` nutzt noch `https://cdn.tailwindcss.com`
- damit haengt der First Paint zusaetzlich an externen Laufzeitdiensten

Auswirkung:

- langsamerer Erstbesuch
- mehr Varianz je nach Netz und CDN
- `@latest` ist unnoetig instabil fuer Produktion

### 7. Waiter hat trotz Verbesserungen noch einen teuren Legacy-Fallback beim Owner-Resolve

Betroffene Stelle:

- `apps/waiter/waiter-app.js:455`

Aktuelles Muster:

- zuerst direkte Pfade
- danach Legacy-Suche ueber mehrere Query-Felder und Email-Varianten

Auswirkung:

- fuer saubere neue Accounts okay
- fuer Legacy-/unscharfe Owner-Daten weiterhin vermeidbare Login-Latenz

### 8. Es fehlt ein harter Regressionsschutz fuer Interaktionspfade

Auffaellig:

- kein sichtbarer automatisierter Testpfad fuer:
- Like -> Unlike -> Like
- Comment senden
- Comment aus Modal vs Feed
- Follow -> Unfollow -> Follow
- Owner Login vs Staff Login vs Waiter Login

Auswirkung:

- einzelne Fixes koennen leicht Seiteneffekte ausloesen
- visuell "funktioniert es" reicht hier nicht mehr als Qualitaetsniveau

## Wahrscheinlichste Hauptursache fuer den Kommentar-Double-Count

Die wahrscheinlichste Hauptursache ist aktuell diese Kombination:

- Post-Counts werden lokal ueber verteilte Objekte mutiert
- der Kommentar-Submit arbeitet noch immer gegen einen lokal mutierbaren Basiswert
- die Standard-Ladepfade gleichen falsche Werte nicht sauber ab, solange die Post-IDs gleich bleiben

Kurz gesagt:

- der Bug lebt nicht nur in `addComment()`
- der Bug wird durch die aktuelle State-Architektur verstaerkt und dann durch unvollstaendige Reconciliation "festgehalten"

## Was fuer echte Stabilitaet noetig ist

### Phase 1: Correctness First

1. Ein kanonischer Post-Store

- ein zentraler Store `postsById`
- alle Views lesen aus Projektionen dieses Stores
- `feedPosts`, `userPosts`, `businessPosts` und Modal halten dann nur noch IDs oder flache Referenzen, nicht eigene zaehlbare Post-Kopien

2. Lokale Post-Updates nur noch ueber definierte Reducer

- `applyRemotePostSnapshot(postId, data)`
- `applyLocalOptimisticPostDelta(postId, delta, operationId)`
- keine direkte Mutation verstreuter Objekte mehr

3. Jede Like-/Comment-Aktion braucht eine Operation-ID

- lokale Optimistic-Updates muessen idempotent sein
- Snapshot-Reconciliation darf eine laufende Operation nicht doppelt "nochmal zaehlen"

4. Loader muessen Wert-Aenderungen reconciliieren, nicht nur ID-Listen

- `loadFeedPosts()`
- `loadUserPosts()`
- `loadBusinessPosts()`

muessen mindestens eine Signatur vergleichen wie:

- `id`
- `likes`
- `comments`
- `updatedAt`
- `caption`
- `logo`

5. Modal darf kein eigener zaehlbarer Sonderzustand sein

- das Modal soll nur `postId` + UI-State halten
- Zaehler und Inhalte kommen aus dem zentralen Store

### Phase 2: Speed

1. Startup-Waterfall reduzieren

- `loadAuthProfile`
- `hydrateRestaurants`
- `resolveRoles`

so weit wie sicher moeglich parallelisieren oder in Fast-Path und Background-Pfade splitten

2. Render-Batching einfuehren

- nicht an dutzenden Stellen direkt `render()`
- stattdessen ein zentraler Scheduler pro Tick oder `requestAnimationFrame`

3. Erstbesuch verschlanken

- `lucide@latest` nicht mehr von `unpkg` zur Laufzeit laden
- `waiter` ohne Tailwind-CDN im Runtime-Pfad
- moeglichst alle kritischen Assets lokal und versioniert ausliefern

4. Nichtkritische Arbeit spaeter

- Restaurant-Logo-Hydration
- Story-Rebuilds
- Kommentar-Avatar-Fetches
- nicht fuer den ersten sichtbaren Screen blockierend machen

5. Cache-Strategie vereinheitlichen

- Cache-Versionen zentral
- klare Regeln fuer Invalidate vs Reconcile
- keine stillen Stale-Zustaende, die nur durch harten Refresh verschwinden

### Phase 3: Bug-Resistenz

1. Invariant Checks im Dev-Mode

- Count darf nie negativ sein
- ein Post darf nicht gleichzeitig widerspruechliche Count-Werte in mehreren Stores haben
- aktive optimistic operations muessen sauber zuordenbar sein

2. Interaktions-Matrix testen

- Feed Like
- Feed Comment
- Modal Comment
- Follow/Unfollow
- Owner Login
- Staff Login
- Waiter Login
- QR -> Menu -> Order -> Waiter

3. Telemetrie fuer Drift

- wenn lokale Counts und Snapshot-Counts auseinanderlaufen, im Dev-Log markieren
- wenn derselbe Post in mehreren Stores verschiedene Werte traegt, warnen

4. Feature-Fix nur noch mit Repro-Fall

- fuer jeden Count-/Follow-/Login-Fix muss ein klarer Repro-Path dokumentiert sein

## Sofort empfohlene Arbeitsreihenfolge

1. Post-State zentralisieren
2. Loader-Reconciliation wertbasiert statt nur ID-basiert machen
3. Kommentar- und Like-Optimistic-Pfade auf Operation-IDs umstellen
4. Render-Scheduler einfuehren
5. Startup-Waterfall reduzieren
6. externe Runtime-Abhaengigkeiten fuer First Visit abbauen
7. Interaktions-Testmatrix fest einbauen

## Erwarteter Effekt nach diesen Massnahmen

Wenn die Punkte oben sauber umgesetzt werden, ist realistisch:

- keine lokalen Double-Counts mehr
- Counts korrigieren sich ohne Hard Refresh
- schnelleres Login
- weniger Nachladen nach erstem Screen
- deutlich weniger Race Conditions
- besser vorhersagbares Verhalten bei Feed, Modal, Follow und Waiter

## Was ich nicht empfehle

- weitere punktuelle Count-Hotfixes ohne State-Bereinigung
- neue Features im Feed, bevor der Post-State stabil ist
- mehr Cache-/Hydrate-Sonderfaelle ohne zentrale Invalidation-Strategie
- mehr Runtime-CDN-Abhaengigkeiten fuer produktive Kernpfade

## Klare Priorisierung

Wenn nur ein Thema sofort angefasst wird, dann dieses:

- Post-State und Count-Reconciliation sauber machen

Wenn zwei Themen sofort angefasst werden, dann:

- Post-State und Count-Reconciliation
- Startup- und Render-Last reduzieren

Diese beiden Themen bringen aktuell am meisten fuer:

- Stabilitaet
- Geschwindigkeit
- wahrgenommene Qualitaet
