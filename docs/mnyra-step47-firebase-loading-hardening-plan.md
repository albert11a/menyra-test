Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 47 - Firebase Ladehaertung fuer bestehende UI

## Ziel

Mnyra soll Firebase schneller und zuverlaessiger laden, ohne die sichtbare
Oberflaeche neu zu bauen.

Dieser Schritt ist bewusst ein Planungs- und Vertrags-Schritt. Er legt fest,
wie die bestehenden Firebase-Ladewege fuer Public Business Profile, Public
Menu, Fokus/Angebote, Beitraege, Feed und Profil-Daten launch-faehig gehaertet
werden sollen.

## Entscheidung

Der groessere Storefront-/Renderer-Umbau wird jetzt nicht gemacht.

Stattdessen bleibt die bestehende UI und bestehende Runtime-Welt erhalten. Die
naechsten Schritte verbessern nur die Datenladequalitaet:

- weniger doppelte Reads
- klare In-Flight-Deduplizierung
- klare leere, fehlerhafte und langsame Zustaende
- keine endlosen `wird geladen...`-Zustaende
- keine stillen UI-/Design-Aenderungen
- keine QR-, Cart-, Order- oder Public-Route-Aenderung ohne eigenen Schritt

## Aktuelle Lade-Wahrheit

### Public Business Profile

Der oeffentliche Pfad `/:slug` und `/:slug/menu` startet ueber
`apps/menyra-social/index.html`.

Der Public-Start nutzt:

- `socialBootstrapFeed` als schnellen Bootstrap-/Preview-Pfad
- `public-route-cache-early-preload.js` fuer fruehe Route-Aufloesung
- `profile-open-flow-utils.js` fuer das Oeffnen des Profils
- `public-profile-runtime-controller.js` fuer Profil-Read und Public Posts
- `profile-business-menu-runtime-cluster.js` fuer Menu-/Fokus-/Posts-Ensures
- `session-data-runtime-controller.js` fuer Menu/Fokus/Feed/Profile-Ladevorgaenge

Der Gast-Public-Profilpfad nutzt bereits keinen dauerhaften Profil-Realtime-
Listener mehr, sondern read-once fuer die Profil-Wahrheit. Das bleibt richtig.

### Public Menu

Das sichtbare Public Menu liest vorrangig:

- `restaurants/{restaurantId}/public/menu`
- `restaurants/{restaurantId}/public/meta`

Fallbacks existieren noch fuer:

- `restaurants/{restaurantId}/menuItems`
- `restaurants/{restaurantId}`

Diese Fallbacks muessen kontrolliert bleiben. Sie duerfen nicht unbemerkt zu
einem schweren Public-Start werden.

### Fokus / Angebote

Fokus liest:

- `restaurants/{restaurantId}/public/offers`
- `restaurants/{restaurantId}/public/meta`

Der aktuelle Renderer koordiniert Fokus mit Menu, damit Fokus nicht spaeter
oberhalb der Produkte einspringt. Das ist fachlich verstaendlich, darf aber
nicht zu einem endlosen Menu-Blocker werden.

### Public Business Beitraege

Public Business Posts lesen aktuell:

- `restaurants/{restaurantId}/socialPosts`

Der Bootstrap-Pfad begrenzt die ersten Posts bereits. Der Client-Pfad fuer
Public Business Posts darf spaeter nicht einfach wieder sichtbar abschneiden,
muss aber einen schnellen ersten sicheren Zustand und anschliessende
Nachladung/Versoehnung bekommen.

### Feed

Feed nutzt:

- `socialBootstrapFeed`
- `socialFeed`
- `restaurants`
- optional Story- und Identitaets-Hydration

Feed bleibt nicht der erste Zielbereich fuer diesen Schritt, darf aber in der
Firebase-Ladehaertung nicht vergessen werden.

## Harte Regeln fuer die Umsetzung

- Keine sichtbare UI-/Design-Aenderung.
- Keine neue Public-Oberflaeche.
- Keine Route-Aenderung ohne separaten Route-Vertrag.
- Keine Firebase Rules-/Functions-Aenderung ohne eigenen Schritt.
- QR muss exakt kompatibel bleiben.
- Cart und Order duerfen nicht nebenbei veraendert werden.
- Bestehende UI darf nur andere Ladezustandsdaten bekommen, nicht andere
  visuelle Struktur.
- Jeder konkrete Fix bleibt klein und einzeln committet.

## Zielverhalten

Firebase-Ladewege sollen sich wie folgt verhalten:

- `ready`: Daten sind vorhanden und passen zum sichtbaren Ziel.
- `empty`: Datenquelle ist erfolgreich leer.
- `error`: Datenquelle ist fehlgeschlagen und hat keinen gueltigen Fallback.
- `stale-ready`: vorhandene Daten duerfen sichtbar bleiben, waehrend frisch
  nachgeladen wird.
- `loading`: nur solange ein echter, aktueller Request fuer den sichtbaren
  Zielkontext laeuft.

Ein sichtbarer Public-Screen darf nicht dauerhaft in `loading` bleiben, wenn
die dazugehoerige Firebase-Wahrheit leer, fehlerhaft oder nicht erreichbar ist.

## Konkrete Folgeschritte

### Schritt 48 - Public Posts Ladehaertung

Ziel:

- Public Business Posts behalten die vollstaendige Sichtbarkeit als Ziel.
- Der erste sichtbare Firebase-Read wird aber sauber begrenzt und dedupliziert.
- Weitere Posts werden kontrolliert nachgeladen oder versoehnt.
- Keine Rueckkehr zum alten `FAST_LIMITS.profilePosts`-Abschneiden.

Zu pruefende Stellen:

- `public-profile-runtime-controller.js`
- `profile-business-menu-runtime-cluster.js`
- `profile-open-flow-utils.js`
- `profile-post-normalization.test.mjs`

### Schritt 49 - Menu/Fokus No-Hang-Haertung

Ziel:

- Public Menu darf nicht endlos auf Fokus blockieren.
- Fokus bleibt fachlich Teil der Menu-Praesentation, bekommt aber eine klare
  Deadline/Empty/Error-Entscheidung.
- Menu bleibt sichtbar, wenn Menu-Wahrheit bereit ist und Fokus leer,
  fehlerhaft oder zu langsam ist.

Zu pruefende Stellen:

- `session-data-runtime-controller.js`
- `focus-runtime-controller.js`
- `public-menu-surface-state-utils.js`
- `profile-menu-focus-render-controller.js`
- bestehende Menu-/Fokus-Tests

### Schritt 50 - Route/Profile Read-Dedupe

Ziel:

- Ein Public Route Start soll nicht mehrfach denselben Slug/Restaurant-Kontext
  aufloesen.
- Bootstrap, Route-Cache, Profile-Open-Flow und read-once Profil-Refresh
  sollen denselben kanonischen `restaurantId`-Handoff nutzen.
- Kein QR-Verhalten veraendern.

Zu pruefende Stellen:

- `public-route-cache-early-preload.js`
- `initial-route-state.js`
- `profile-open-flow-utils.js`
- `public-profile-runtime-controller.js`

### Schritt 51 - Feed/Profile Firebase Fallbacks

Ziel:

- Feed, Profil und Business-Profile bekommen klare Fehler-/Empty-Entscheidungen.
- Hintergrund-Hydration darf sichtbare stabile Daten nicht loeschen.
- Authentifizierte Live-Listener duerfen Public-/Gast-Starts nicht schwerer
  machen.

Zu pruefende Stellen:

- `session-data-runtime-controller.js`
- `auth-session-startup-coordinator.js`
- `feed-visibility-runtime-cluster.js`
- `self-profile-runtime-controller.js`

### Schritt 52 - Firebase Lade-Diagnostik ohne UI-Aenderung

Ziel:

- Ladehaenger gezielt sichtbar machen, ohne neue UI zu bauen.
- Nur interne Timeline-/Console-/Budget-Marken, falls noetig.
- Keine Playwright-/Smoke-Laeufe durch Codex.

Zu pruefende Stellen:

- bestehende `markLoadingEvent`-/`timeLoadingAsync`-Pfade
- Runtime-Budget-Marken
- vorhandene Bundle-/Unit-Guards

## Bewertung

`analysiert, noch nicht umgesetzt`

Der sichere Weg ist machbar, aber nicht als ein grosser Umbau. Die naechsten
Fixes muessen einzeln und messbar bleiben. Der erste technische Kandidat ist
Public Posts, weil dort der Client-Pfad aktuell schwer werden kann und trotzdem
die bestehende Beitrags-Vollstaendigkeit erhalten bleiben muss.

## Geaenderte Dateien

- `docs/mnyra-step47-firebase-loading-hardening-plan.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Runtime-Aenderung.
- Keine Firebase-Pfade, Queries oder Payloads geaendert.
- Keine Firebase Rules geaendert.
- Keine Cloud Functions geaendert.
- Keine Route geaendert.
- Kein Storefront-/Renderer-Umbau.
- Kein Bundle-Build.
- Kein Dev Server.
- Kein Playwright.

## Checks

- Doku-Review per Dateipruefung.
- `git diff --check`

## Manuelle Testliste

Da dieser Schritt keine Runtime aendert:

- Keine manuelle Produktpruefung zwingend noetig.
- Fuer den naechsten technischen Schritt danach weiter pruefen:
  `/feed`, `/:slug`, `/:slug/menu`, Public Posts, Public Menu, Fokus, QR,
  Cart, Order und eigenes Business-Profil.
