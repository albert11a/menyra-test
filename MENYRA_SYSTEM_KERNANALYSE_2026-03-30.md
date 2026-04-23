# MENYRA System Kernanalyse

Stand: 2026-03-30  
Codebasis: aktueller `main` nach Rollback auf den guten Stand  
Basis dieser Analyse: direkter Code-Scan des Repos, keine neuen Fixes

## 1. Worum es hier geht

Diese Datei soll eine feste Wahrheit im Root sein.

Ziel:

- das komplette Menyra-System als Ganzes sehen
- nicht nur einzelne Bugs ansehen
- verstehen, warum sich die Seite manchmal gut anfuehlt und manchmal nicht
- klaeren, ob das aktuelle `main` wirklich launch-fertig ist oder nur in warmen Tests gut wirkt
- die Stellen benennen, an denen Geschwindigkeit, Sauberkeit und Stabilitaet im Kern entstehen oder kaputtgehen

Wichtig:

- Das ist eine Code-Analyse.
- Ich habe hier nicht jede Live-Route im Browser komplett durchgeklickt.
- Ich habe aber die zentralen Pfade, Datenquellen, Caches, Bootstrap-Wege, Listener, Service Worker, Tests und Serverwege im Code durchgearbeitet.

Kurz gesagt:

- Dein aktuelles `main` ist nicht "komplett kaputt".
- Aber es ist auch nicht "eine einzige saubere Wahrheit mit garantiert instant richtiger Anzeige fuer jeden neuen Gast".
- Der Kernfehler ist strukturell: dieselbe Sache lebt an mehreren Orten und wird je nach Weg anders oder spaeter vervollstaendigt.

## 2. Kurzfazit in hart

Die App fuehlt sich bei dir oft okay an, weil:

- du wahrscheinlich haeufig ein warmer Besucher bist
- Browser-Cache, Firebase-Cache und lokale App-Caches schon gefuellt sind
- `FAST_MODE` global aktiv ist
- viele Screens erstmal mit Schnell- oder Ersatzdaten etwas zeigen

Das heisst aber nicht automatisch, dass ein neuer Gast unter schwachem Netz dieselbe Wahrheit sieht.

Meine ehrliche Bewertung:

- Das aktuelle `main` ist kein Totalschaden.
- Es gibt viel mehr echte Struktur als in einer chaotischen Early-Stage-App.
- Aber fuer "wirklich sauber, wirklich instant, wirklich dieselbe Wahrheit fuer fast alle Nutzer" ist der Kern noch nicht dort.

Der Hauptgrund ist nicht ein einzelner Bug, sondern diese Mischung:

1. Schnellstart und echte Daten laufen nebeneinander.
2. Karte, Profil, Feed, Story und Menue ziehen dieselbe Sache nicht immer aus derselben Quelle.
3. Mehrere Teile zeigen zuerst eine Annahme und holen erst danach die echte Wahrheit.
4. Es gibt viele lokale Caches und mehrere Sicht-States pro derselben Sache.

## 3. Systemkarte

### 3.1 Hauptsysteme

Das Repo ist nicht nur "eine Web-App", sondern mehrere laufende Teile:

- `apps/menyra-social/`
  - Hauptprodukt
  - Feed, Stories, Suche, Karte, Profile, Menue, Bestellungen, Chat, Push, CRM
- `apps/waiter/`
  - Waiter-/Staff-Oberflaeche fuer Restaurant-Bestellungen
- `apps/mnyra-heart/`
  - internes CEO-/Monitoring-/Test-Center
- `functions/`
  - Firebase Functions
  - Push, Social-Bootstrap, Media-Tickets, Waiter-Benachrichtigungen, Heart-Webhooks
- `shared/`
  - Firebase-Config, Basis-Styles, Runtime-Error-Reporter, gemeinsame Utils
- `tests/mnyra-heart-runner/`
  - Playwright-basierte Rollen- und Journey-Tests
- `hub/` + Root `index.js`
  - internes Link-/Test-Hub

### 3.2 Groessenordnung

Ohne `node_modules`:

- `apps/menyra-social`: 209 Dateien, 51.649 Zeilen
- `apps/waiter`: 3 Dateien, 1.661 Zeilen
- `apps/mnyra-heart`: 22 Dateien, 6.989 Zeilen
- `functions`: 15 Dateien, 8.449 Zeilen
- `shared`: 14 Dateien, 612 Zeilen
- `tests`: 160 Dateien, 31.339 Zeilen

Wichtiger Punkt:

- Das System ist nicht klein.
- Die Sozial-App allein ist gross genug, dass "einfach weiter kleine Fixes oben drauf" fast sicher neue Seiteneffekte bringt.

## 4. Die groessten Knotenpunkte

Die groessten und riskantesten Dateien im Social-Kern:

- `apps/menyra-social/social-app.js` - 3788 Zeilen
- `apps/menyra-social/core/crm/crm-runtime-controller.js` - 2429 Zeilen
- `apps/menyra-social/core/app-shell/controller-deps-factory.js` - 2087 Zeilen
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js` - 1787 Zeilen
- `apps/menyra-social/core/chat/chat-runtime-controller.js` - 1697 Zeilen
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js` - 1335 Zeilen
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js` - 1281 Zeilen
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js` - 1279 Zeilen
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js` - 1124 Zeilen
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js` - 1055 Zeilen

Was das bedeutet:

- Nicht jede Datei ist gleich wichtig.
- Stabilitaet und Instabilitaet konzentrieren sich an wenigen grossen Koordinatoren.

## 5. Was heute schon gut ist

Es waere falsch zu sagen, das System sei nur schlecht. Das stimmt nicht.

Positiv:

1. Es gibt bereits klare Systemteile.
   - Social, Waiter, Heart, Functions, Shared, Tests sind getrennt.

2. Firestore-Regeln sind nicht offen.
   - `firestore.rules` startet mit klarer Rollen- und Restaurant-Logik.
   - Default-Deny ist vorhanden.

3. Es gibt echte Test-Infrastruktur.
   - Heart + Playwright-Runner pruefen Gast, Business, User, CEO und QR-Wege.
   - Das ist deutlich mehr als bei vielen kleinen Projekten.

4. Es gibt Runtime-Fehlererfassung im Client.
   - `shared/runtime-error-reporter.js`
   - Social und Waiter binden ihn ein.

5. Bestellungen sind strukturell sauber getrennt.
   - Gastbestellungen gehen in `restaurants/{rid}/orders`
   - eingeloggte Nutzer bekommen zusaetzlich `users/{uid}/orders`

6. Heart ist kein Fake.
   - Es gibt echte Smoke-/Synthetic-Runs, GitHub-Workflow-Dispatch, Incident- und Report-Wege.

Wichtig:

- Das System hat also echte Substanz.
- Das Problem ist nicht "alles ist Schrott".
- Das Problem ist "der Wahrheitskern ist an mehreren Stellen gleichzeitig und nicht streng genug".

## 6. Der eigentliche Kernfehler

Der groesste Fehler im aktuellen Menyra-Stand ist:

> dieselbe Sache hat mehr als eine Wahrheit

Das passiert bei:

- Restaurants
- Business-Profilen
- Beitragen
- Stories
- Menues
- Fokus-Items
- Follower/Folgt-Zahlen

Und genau daraus entstehen diese Symptome:

- etwas ist erst leer und dann spaeter da
- etwas ist hier sichtbar, dort aber nicht
- Karte zeigt etwas anderes als Suche
- Business-Profil zeigt etwas anderes als Karte
- Menue braucht zu lange oder springt
- QR landet nicht als echter Direktweg, sondern fuehlt sich wie ein spaeterer Umbau an

## 7. Wo dieselbe Sache mehrfach lebt

### 7.1 Restaurants / Business-Identitaet

Restaurants leben heute nicht nur an einer Stelle.

Sie stecken gleichzeitig in:

- `state.restaurants`
- Bootstrap-Payload aus `socialBootstrapFeed`
- lokaler Cache `menyra_social_restaurants_cache_v1`
- spaeterer Voll-Load aus `loadRestaurants()`
- partieller Nachhydration aus Feed/Stories
- Auth-Resolution fuer Business-/Lead-/Staff-Aufloesung

Relevante Stellen:

- `apps/menyra-social/social-app.js:591-595`
- `apps/menyra-social/social-app.js:631-645`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:151-167`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:686-762`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js:168-275`
- `apps/menyra-social/core/auth/auth-profile-resolution-runtime.js:100-209`
- `functions/index.js:1062-1087`
- `functions/index.js:1085`

Wichtig:

- Das Bootstrap liefert nur 120 Restaurants.
- Der volle Restaurant-Load holt spaeter die komplette Sammlung.
- Der Bootstrap kann aber vorher schon `state.restaurants` und den Restaurant-Cache fuellen.

Das ist nicht dieselbe Wahrheit.

### 7.2 Beitraege / Posts

Dieselbe Post-Welt lebt in mehreren Listen:

- `state.feedPosts`
- `state.userPosts`
- `state.businessPosts`
- `state.profileView.posts`
- `state.profileModal.profile.posts`
- `state.postModal.post`

Relevante Stellen:

- `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:439-464`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:231-240`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:423-449`

Das ist einer der Hauptgruende fuer:

- andere Counts in Feed und Profil
- spaete Korrekturen
- "hier geliked, dort erst spaeter richtig"

### 7.3 Stories

Stories kommen nicht nur aus echten Story-Dokumenten.

Wenn keine echten Stories da sind, baut die App im Fast-Mode eine Story-Leiste aus Feed-Posts.

Relevante Stellen:

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js:493`
- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js:526`
- `apps/menyra-social/core/feed/feed-story-utils.js:13-31`
- `apps/menyra-social/core/stories/story-feed-runtime-controller.js:1-200`

Das macht die App oft schneller wirkend.
Aber es ist nicht dieselbe Wahrheit wie echte Stories.

### 7.4 Menue

Das Menue hat heute keine einzige klare Quelle.

Es kann kommen aus:

- `restaurants/{rid}/public/menu`
- `restaurants/{rid}/menuItems`
- dem alten Restaurant-Dokument selbst
- Hybrid-Kombinationen mit Nachfuellen fehlender Bilder/Daten

Relevante Stellen:

- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:397-423`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:687-724`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:975-1030`

Das ist funktional flexibel.
Aber es ist keine klare Lehrbuch-Wahrheit.

### 7.5 Business-Profil und Zaehler

Das oeffentliche Business-Profil und das eigene Business-Profil nutzen nicht exakt denselben Weg.

Relevante Stellen:

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js:72-99`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js:138-155`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js:207-220`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js:1174-1208`

Das bedeutet:

- oeffentliches Profil liest eher Restaurant-Daten
- eigenes Business-Profil fuellt fehlende Daten auch aus Owner-/User-Daten auf

So koennen Follower/Folgt-Zahlen auseinanderlaufen.

## 8. Der echte Startpfad heute

### 8.1 Grundbild

Die App startet nicht mit "einem kleinen eindeutigen Kern".
Sie startet mit einer Mischung aus:

- lokaler Persistenz
- Auth-Snapshot
- pending route state
- oeffentlichem Bootstrap
- spaeterem Voll-Load

Relevante Stellen:

- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js:127-135`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:217-271`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:124-229`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:141-252`

Das ist der Grund, warum sich manches schnell anfuehlt, aber nicht immer sofort dieselbe Endwahrheit zeigt.

### 8.2 Globaler Fast-Mode

`FAST_MODE` ist global aktiv.

Relevante Stelle:

- `apps/menyra-social/social-app.js:628`

Zusammen mit den `FAST_LIMITS`:

- `apps/menyra-social/social-app.js:608-626`

Das heisst praktisch:

- die App ist von Grund auf auf Schnell-Darstellung getrimmt
- nicht nur bei schwachem Netz, sondern grundsaetzlich

Das ist nicht automatisch falsch.
Aber es heisst:

- Wahrheit und Geschwindigkeit werden gleichzeitig verhandelt
- und nicht sauber getrennt

## 9. Gast-, Werbe- und QR-Flows

### 9.1 Neuer Gast ueber Werbung

Was gut ist:

- Gast darf `feed`, `search`, `map`, `orders`, `profile` nutzen
- siehe `apps/menyra-social/core/auth/session-tab-guards.js:1-14`

Was kritisch ist:

- Bootstrap zieht nur Teil-Daten
- Stories koennen aus Feed-Fallback kommen
- Restaurants koennen erst spaeter vollstaendig werden

Fazit:

- Fuer einen warmen oder normalen Erstbesuch wirkt das oft okay.
- Fuer "jeder Gast, jedes Netz, immer dieselbe Wahrheit" reicht der Kern noch nicht.

### 9.2 QR-Gast im Restaurant

Der QR-/Restaurant-Weg ist im aktuellen `main` nicht als eigener kleiner Kernpfad gebaut.

Was heute passiert:

1. Route erkennt `r`/`restaurant` und `tab`
   - `apps/menyra-social/core/auth/initial-route-state.js:12-54`

2. Gast darf `menu` nicht als Tab
   - `apps/menyra-social/core/auth/session-tab-guards.js:1-14`

3. Darum faellt `menu` fuer den Gast erst auf `feed`
   - `apps/menyra-social/core/auth/session-tab-guards.js:13`

4. Danach wird das Profil spaeter geoeffnet
   - `apps/menyra-social/core/auth/auth-session-startup-coordinator.js:127-135`
   - `apps/menyra-social/core/router/deeplink-flow-utils.js:272-314`

5. Das Business-Profil zeigt zuerst Ersatz-Posts aus dem Feed
   - `apps/menyra-social/core/profile/profile-open-flow-utils.js:139-181`

6. Erst danach kommen echte Business-Daten und echte Business-Posts
   - `apps/menyra-social/core/profile/profile-open-flow-utils.js:168-181`

Zusaetzlich kritisch:

- `deeplink-flow-utils` macht `menu` ohne klares `source` schnell zu `qr`
  - `apps/menyra-social/core/router/deeplink-flow-utils.js:298-306`

Kurz:

- Der QR-Weg ist heute nicht "ein eigener echter Restaurant-Start".
- Er ist eher ein nachtraeglich umgelenkter allgemeiner Start.

## 10. Karte und Standortwahrheit

### 10.1 Erfundene Koordinaten

Die Karte erfindet fuer Businesses Koordinaten, wenn keine echten Koordinaten da sind.

Relevante Stellen:

- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:133-145`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:170`

Dort wird:

- auf Prishtina-Basis gesetzt
- mit Hash-Verschiebung ein Punkt erzeugt

Das ist fuer eine Demo okay.
Fuer eine echte Standortwahrheit ist es falsch.

### 10.2 Stabile Koordinaten koennen richtige Koordinaten ueberstimmen

`preferStableCoordsCore` verwirft einen Kandidaten als Ausreisser, wenn er mehr als 1.5 Grad abweicht.

Relevante Stelle:

- `apps/menyra-social/core/map/geo-coord-utils.js:32-43`

Das kann sinnvoll sein, um Schrottdaten abzufangen.
Aber:

- wenn Referenzdaten alt oder falsch sind
- und neue echte Koordinaten weiter weg liegen

dann gewinnt der alte falsche Punkt.

### 10.3 Kartenbasis ist zuerst Teilmenge

Der oeffentliche Bootstrap nimmt nur 120 Restaurants:

- `functions/index.js:1085`

Und der Client schreibt diese Restaurants schon in `state.restaurants` und Cache:

- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:151-167`

Der volle Restaurant-Load kommt erst spaeter:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:686-762`

Dadurch gilt fuer die Karte:

- zuerst Teilmenge
- spaeter Vollmenge

Das ist genau die Art von Verhalten, die fuer Nutzer wie "mal sehe ich alles, mal nicht" wirkt.

### 10.4 Restaurant-Signatur ignoriert Standorte

Die Restaurant-Identitaets-Signatur beachtet aktuell nur:

- `id`
- `name`
- `logo`

Relevante Stelle:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:687-693`

Koordinaten, City und Standorte sind dort nicht Teil der Gleichheitspruefung.

Das heisst:

- Standortaenderungen koennen als "keine Aenderung" durchgehen
- obwohl fuer Karte und Suche genau das die wichtige Aenderung ist

## 11. Profil und Business-Menue

### 11.1 Oeffentliches Business-Profil nimmt zuerst lokale Restaurant-Daten

`fetchBusinessProfileDoc` nimmt zuerst das Restaurant aus `state.restaurants`, wenn es schon da ist.

Relevante Stelle:

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js:207-220`

Das bedeutet:

- eine Teil- oder Bootstrap-Version des Restaurants kann schon als Profilgrundlage reichen
- auch wenn spaeter erst das echte Dokument aus Firestore kommt

### 11.2 Business-Profil zeigt zuerst Feed-Ersatzposts

Beim Oeffnen eines Business-Profils:

- werden erst Posts aus `state.feedPosts` gefiltert
- daraus wird ein Platzhalter-Profil gebaut
- erst danach werden echtes Profil und echte Business-Posts geladen

Relevante Stelle:

- `apps/menyra-social/core/profile/profile-open-flow-utils.js:139-181`

Das fuehlt sich schnell an.
Aber es ist nicht dieselbe Wahrheit.

### 11.3 Menue kommt aus mehreren Wegen

Die Menue-Logik ist funktional stark, aber truth-maessig gemischt:

- `public/menu`
- `menuItems`
- Legacy-Menu im Restaurant-Dokument
- Hybrid-Zusammenbau

Relevante Stelle:

- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:687-724`

Das heisst:

- das Menue kann vollstaendig werden
- aber nicht garantiert aus nur einer Quelle

## 12. Feed, Story, Profil, Modal

Die Feed-/Profil-Welt hat einen klaren strukturellen Drift-Risiko.

Belege:

- `findPostById` sucht in mehreren Listen und Views
  - `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:455-464`
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js:231-240`

- `updatePostCaches` muss mehrere Caches/Liste gleichzeitig synchron halten
  - `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:439-451`

Das bedeutet:

- dieselbe Post-Aenderung muss an vielen Orten synchron ankommen
- wenn ein Ort nachhaengt, sieht ein Bereich alt aus und ein anderer schon neu

Das ist kein Einzelfehler.
Das ist ein Strukturthema.

## 13. Suche / Discovery

Die Discovery-Logik ist stark, aber ebenfalls gemischt:

- lokale Business-Suche nutzt `state.restaurants`, wenn vorhanden
- sonst nimmt sie Businesss aus dem Feed

Relevante Stellen:

- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:568`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:601-603`

Das heisst:

- je nach Ladezeit ist dieselbe Suche auf anderer Datengrundlage unterwegs

## 14. Waiter

Der Waiter-Teil ist wesentlich kleiner und klarer als Social.

Positiv:

- eigener Firebase-App-Name
- eigene Firestore-/Auth-Initialisierung
- klarer Statusfluss fuer Bestellungen
- eigene Push-/SW-Struktur

Relevante Stellen:

- `apps/waiter/waiter-app.js:1-120`
- `apps/waiter/index.html:13`
- `apps/waiter/sw.js`

Schwachpunkt:

- Waiter zieht `tailwindcss.com` direkt zur Laufzeit
  - `apps/waiter/index.html:13`

Das ist fuer Produktion unnoetig fragil.

## 15. Heart / Monitoring / Tests

Hier ist das Bild besser als erwartet.

Es gibt:

- echte Heart-App
- echte Functions fuer Heart
- echte GitHub-Workflow-Dispatches
- echte Playwright-Packs fuer Gast, Business, User, CEO, QR

Relevante Stellen:

- `apps/mnyra-heart/README.md`
- `.github/workflows/mnyra-heart-smoke.yml:4`
- `.github/workflows/mnyra-heart-synthetic.yml:4`
- `.github/workflows/mnyra-heart-smoke.yml:78,132-134`
- `.github/workflows/mnyra-heart-synthetic.yml:78,163-165`
- `tests/mnyra-heart-runner/src/packs/full-platform-pack.mjs`
- `tests/mnyra-heart-runner/src/packs/guest-pack.mjs`
- `tests/mnyra-heart-runner/src/packs/business-pack.mjs`
- `tests/mnyra-heart-runner/src/packs/user-pack.mjs`

Aber:

- die Workflows sind `workflow_dispatch`, also manuell startbar
- nicht automatisch auf jeden Push oder auf jeden Merge nach `main`

Das heisst:

- Testabdeckung ist da
- Release-Gate ist nicht hart genug automatisiert

## 16. Fehlererfassung und Betrieb

### 16.1 Was gut ist

- Es gibt `shared/runtime-error-reporter.js`
- Social und Waiter binden ihn ein
- Es gibt ein Monitoring-Runbook

Relevante Stellen:

- `shared/runtime-error-reporter.js`
- `docs/monitoring-logging-runbook.md`

### 16.2 Was noch nicht reicht

Der Runtime-Reporter speichert Clientfehler nur im Browserstore.

Wichtige Stelle:

- `shared/runtime-error-reporter.js`

Es gibt dort keine direkte produktive Weiterleitung an:

- Sentry
- Bugsnag
- eigenes Error-Backend
- Heart-Incident-Pipeline

Das heisst:

- echte Client-Fehler sind strukturell sichtbar im Browser
- aber nicht automatisch zentral gesammelt

## 17. Externe Laufzeit-Abhaengigkeiten

Social und Waiter haengen direkt an externen Assets zur Laufzeit:

- Firebase ESM von `www.gstatic.com`
- Fonts von `fonts.googleapis.com`
- Leaflet / Lucide von `unpkg.com`
- Tailwind CDN im Waiter

Relevante Stellen:

- `apps/menyra-social/index.html:76-94`
- `apps/menyra-social/index.html:653`
- `apps/waiter/index.html:13`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:8,101,373`

Das ist nicht automatisch falsch.
Aber es macht Erstbesuch und Schwachnetz variabler und weniger deterministisch.

## 18. Veraltete oder doppeldeutige interne Wahrheiten

### 18.1 Altes Audit-Dokument mit Passwort-Hinweis

Ein aelteres Audit-Dokument nennt ein hartcodiertes Default-Passwort:

- `docs/social-stability-performance-audit.md:128`

Im aktuellen Code-Scan habe ich diesen konkreten String heute nicht mehr im aktiven Code gefunden.

Das ist wichtig:

- der alte Audit-Punkt scheint als Dokument noch da zu sein
- aber nicht mehr als direkter String im aktuellen aktiven Hauptcode

Das ist gut.
Aber es zeigt auch:

- einige vorhandene Audit-Dateien koennen bereits teilweise veraltet sein

### 18.2 Test Hub kann falsches Bild geben

Der interne Root-Test-Hub mappt mehrere unterschiedliche Buttons auf denselben Social-Menue-Link:

- `index.js:50-56`

Konkret:

- `karte`
- `detajet`
- `porosia`
- `waiter`

zeigen dort nicht wirklich vier verschiedene Ziele.

Das kann interne Tests verfaelschen.

## 19. Was aktuell wahrscheinlich wirklich stimmt

### 19.1 Dinge, die wahrscheinlich fuer viele Nutzer okay wirken

- normaler warmer Feed-Besuch
- normales Scrollen im Feed
- viele Profil- und Business-Flaechen im warmen Zustand
- Gastbestellung im Grundprinzip
- Waiter-Grundansicht
- CEO-/Heart-Grundstruktur

### 19.2 Dinge, die aktuell nicht als "garantiert sauber fuer jeden neuen Nutzer" gelten sollten

- QR-Kaltstart direkt sauber ohne Zwischenzustand
- Karte immer vollstaendig richtig im ersten Moment
- Menue immer sofort aus derselben Quelle
- Story immer identisch zwischen Story-Leiste und echtem Story-Viewer
- Profil-, Feed- und Modal-Post immer sofort im selben Stand
- Business-Follower/Folgt immer in jedem Kontext identisch

## 20. Ist das aktuelle main launch-fertig?

Meine ehrliche Antwort:

- Fuer einen kleinen Soft-Launch oder Beta mit wacher Beobachtung: vielleicht ja.
- Fuer "jeder neue Nutzer, schwaches Internet, immer instant, immer dieselbe Wahrheit, keine Sorgen": nein.

Warum nein:

1. Restaurant-Wahrheit ist noch nicht eine Quelle.
2. QR ist noch kein eigener harter Restaurant-Startkern.
3. Karte darf heute noch mit erfundenen oder stabilisierten Koordinaten arbeiten.
4. Menue ist noch Hybridlogik statt ein sauberer single-source Pfad.
5. Stories koennen zuerst Feed-Ersatz sein.
6. Posts leben in mehreren Listen gleichzeitig.
7. Tests sind gut, aber nicht hart vor jedem Release erzwungen.

Wichtig:

- Das heisst nicht, dass du nicht launchen kannst.
- Es heisst: du darfst den aktuellen Stand nicht mit "wirklich sauberer Kernstabilitaet" verwechseln.

## 21. Der wichtigste Gedanke fuer die naechste Phase

Der naechste Fortschritt darf nicht sein:

- noch mehr kleine Fixes oben drauf
- noch mehr Sonderfaelle
- noch mehr "wir zeigen erstmal irgendwas und korrigieren spaeter"

Der naechste Fortschritt muss sein:

> pro Domain genau eine sichtbare Wahrheit

Das gilt zuerst fuer:

1. Restaurant
2. Business-Profil
3. Menue
4. Post
5. Story

## 22. Meine klare Kernbewertung

Wenn ich das System brutal ehrlich beschreibe:

- Menyra hat schon ein echtes Produktgeruest.
- Die Tests und die Heart-Struktur sind ein echter Pluspunkt.
- Das aktuelle `main` ist nicht nur "ein paar kleine Bugs entfernt von perfekt".
- Der Kern ist noch nicht streng genug.

Warum du beim Weiterbauen oft das Gefuehl hast, es wird eher schlechter:

- weil du auf eine Architektur draufpatchst, in der Geschwindigkeit oft ueber Teilwahrheiten gekauft wird
- und nicht ueber einen kleinen, sauberen, eindeutigen Kern

Deshalb fuehlt sich vieles bei dir lokal okay an, aber nicht belastbar genug fuer die Aussage:

- "jeder neue Nutzer bekommt immer dieselbe richtige Sicht"

## 23. Was ich als naechste saubere Analysebasis setze

Wenn wir ab hier ernsthaft auf Kernstabilitaet gehen, dann muessen wir nicht mit 100 Baustellen anfangen, sondern mit diesen 5 Systemfragen:

1. Was ist die eine Wahrheit fuer Restaurant-Identitaet?
2. Was ist die eine Wahrheit fuer Business-Profil und Zaehler?
3. Was ist die eine Wahrheit fuer Menue?
4. Was ist die eine Wahrheit fuer Post/Feed/Profil/Modal?
5. Was ist der eine echte Gast-/QR-Startkern?

Solange diese 5 Fragen nicht sauber entschieden sind, wird jedes neue Performance- oder UI-Fix weiter gegen Seiteneffekte ankaempfen.

## 24. Abschluss

Meine harte Antwort auf deine Ausgangsfrage ist:

- Nein, das aktuelle `main` ist nicht klar beweisbar "komplett launch-fertig bis auf paar Kleinigkeiten".
- Aber auch nein, es ist nicht einfach nur schlecht.
- Es ist ein gewachsenes System mit echter Substanz, echter Testbasis und echter Produktlogik.
- Der Engpass ist jetzt nicht mehr Feature-Menge, sondern Wahrheitsdisziplin im Kern.

Wenn wir die naechste Phase richtig machen, dann nicht mit mehr Patches, sondern mit einer Kern-Sanierung der Datenwahrheiten und Startpfade.

## 25. Echte Blocker fuer Schnelligkeit, Flow und Zuverlaessigkeit

Hier geht es jetzt nicht mehr um allgemeine Architektur, sondern um die Stellen, die heute wirklich die Web bremsen oder unzuverlaessig machen.

Das sind die wichtigsten echten Blocker.

### 25.1 Menue startet zu spaet

Der groesste konkrete Menue-Blocker ist:

- Das Menue startet nicht schon beim Oeffnen des Business-Profils.
- Es startet erst waehrend die Menue-Ansicht schon gerendert wird.

Code:

- `apps/menyra-social/core/profile/profile-open-flow-utils.js:167`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:1668`
- `apps/menyra-social/core/profile/profile-menu-focus-utils.js:18`

Was passiert:

- Beim Oeffnen des Business-Profils werden zuerst nur Profil und Beitraege geladen.
- Das Menue wird erst spaeter angestossen, wenn die Menue-Ansicht selbst schon da ist.

Warum das schlecht ist:

- Der Nutzer ist schon auf dem richtigen Screen, aber das eigentliche Menue startet erst dann.
- Das fuehlt sich bei QR und schwachem Internet unnoetig spaet an.

### 25.2 Menue-Lesen macht auf dem Leseweg noch Schreibarbeit

Das ist einer der haertesten "hilft eigentlich, schadet aber" Punkte.

Code:

- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:687`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:707`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:716`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:710`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:719`

Was passiert:

- Wenn das oeffentliche Menue noch nicht da ist, liest die App erst die Collection oder alte Felder.
- Danach schreibt sie auf demselben Nutzerweg das Menue noch nach `public/menu`.
- Und sie wartet dabei.

Warum das schlecht ist:

- Ein erster Menue-Aufruf ist dann nicht nur Lesen, sondern Lesen plus Schreiben.
- Genau der erste Gast bezahlt dann die Aufraeumarbeit des Systems.
- Das ist nicht lehrbuchmaessig fuer einen schnellen Gastpfad.

### 25.3 Der Schnellstart bricht bei schwachem Netz zu schnell ab

Code:

- `apps/menyra-social/index.html:609`
- `apps/menyra-social/index.html:611`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:217`
- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js:135`

Was passiert:

- Der Schnellstart wird nach `1200ms` abgebrochen.
- Das gilt schon im HTML vor dem App-Start und spaeter noch einmal im Runtime-Controller.

Warum das schlecht ist:

- Unter schwachem Internet verliert genau der Nutzer, der den Schnellstart am meisten braucht, diesen Schnellstart am schnellsten.
- Danach faellt die App auf langsamere Einzellader zurueck.

Das ist kein kleiner Bug, sondern ein echter Flow-Blocker fuer neue Gaeste.

### 25.4 Restaurant-Liste ist erst Teil-Wahrheit und spaeter Gesamt-Wahrheit

Code:

- `functions/index.js:1084`
- `functions/index.js:1085`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:149`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:686`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:178`

Was passiert:

- Der Bootstrap liefert nur die ersten `120` Restaurants.
- Diese Teil-Liste wird schon in `state.restaurants` gemischt.
- Die volle Restaurant-Liste kommt spaeter ueber einen kompletten Firestore-Lauf.
- Und sie wird nicht einmal fuer jeden Startweg sofort geladen, sondern spaeter je nach Tab.

Warum das schlecht ist:

- Karte, Suche, Profile und Restaurant-Hydrierung arbeiten damit erst mit einer Teil-Wahrheit.
- Je nach Weg sieht der Nutzer zuerst nur einen Ausschnitt.
- Genau das fuehlt sich nach "hier passt etwas nicht" an.

### 25.5 Die volle Restaurant-Liste wird komplett gezogen

Code:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:758`

Was passiert:

- `loadRestaurants()` zieht die ganze Collection `restaurants` ohne Pagination und ohne klaren Start-Zuschnitt.

Warum das schlecht ist:

- Solange die Datenmenge klein ist, faellt es weniger auf.
- Wenn mehr Restaurantkunden dazukommen, wird genau dieser Weg immer schwerer.
- Das ist kein Gast-optimierter Startpfad.

### 25.6 Restaurant-Cache merkt Standortaenderungen nicht sauber

Code:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:687`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:692`

Was passiert:

- Die Restaurant-Signatur vergleicht nur `id`, `name`, `logo`.
- Standortdaten sind darin nicht drin.

Warum das schlecht ist:

- Ein Restaurant kann im Cache als "gleich" gelten, obwohl sich Standortdaten geaendert haben.
- Dann wirkt die App ruhig, ist aber mit alten Karten-Daten unterwegs.

### 25.7 Die Karte darf noch falsche Koordinaten bauen

Code:

- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:145`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:146`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:169`
- `apps/menyra-social/core/map/geo-coord-utils.js:32`
- `apps/menyra-social/core/map/geo-coord-utils.js:42`

Was passiert:

- Wenn echte Koordinaten fehlen, baut die Karte Ersatz-Koordinaten rund um einen festen Basisort.
- Und wenn zwei Punkte zu weit auseinander liegen, gewinnt der Referenzpunkt und nicht der Kandidat.

Warum das schlecht ist:

- So kann die Karte flach ruhig aussehen, aber in Wahrheit falsche Orte zeigen.
- Das ist schlimmer als langsam.
- Das darf fuer einen Launch eigentlich nicht passieren.

### 25.8 Stories brauchen mehrere Runden, bis sie wirklich fertig sind

Code:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:224`
- `apps/menyra-social/core/stories/story-feed-runtime-controller.js:267`
- `apps/menyra-social/core/stories/story-feed-runtime-controller.js:291`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js:104`
- `apps/menyra-social/core/stories/story-viewer-runtime-controller.js:150`
- `apps/menyra-social/core/stories/story-viewer-runtime-controller.js:804`

Was passiert:

- Storys kommen erst aus Cache oder leer.
- Dann kommt eine Collection-Group-Abfrage.
- Danach wird Identitaet der Restaurants noch extra nachgezogen.
- Beim Oeffnen im Viewer wird fuer das Restaurant wieder separat geladen.

Warum das schlecht ist:

- Storys wirken dadurch haeufig spaeter "vollstaendig" als der Rest.
- Das ist nicht nur Netzzeit, sondern auch ein mehrstufiger Story-Aufbau.

### 25.9 Feed, Profil und Story leben nicht aus einer sichtbaren Wahrheit

Code:

- `apps/menyra-social/core/profile/profile-open-flow-utils.js:139`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js:206`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js:1174`
- `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:439`
- `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:455`

Was passiert:

- Das Business-Profil nutzt beim Oeffnen Feed-Beitraege als Ersatz.
- Oeffentliches Profil und eigenes Business-Profil ziehen Zaehler nicht streng aus derselben Quelle.
- Posts werden an mehreren Stellen gleichzeitig gehalten und gepatcht.

Warum das schlecht ist:

- Das fuehlt sich warm oft schnell an.
- Es ist aber genau die Art "schnell", die spaeter kleine Unterschiede und Nachspringen erzeugt.

### 25.10 Externe Laufzeit-Abhaengigkeiten bremsen den ersten Besuch

Code:

- `apps/menyra-social/index.html:82`
- `apps/menyra-social/index.html:84`
- `apps/menyra-social/index.html:92`
- `apps/menyra-social/index.html:94`
- `apps/menyra-social/index.html:653`
- `apps/menyra-social/social-app.js:407`
- `apps/menyra-social/social-app.js:408`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:372`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js:373`

Was passiert:

- Google Fonts, Firebase-Module, `lucide`, Leaflet und Kartentiles kommen ueber externe Hosts.
- Die Karte braucht bei erstem Aufruf sogar noch Leaflet plus Tile-Server.

Warum das schlecht ist:

- Bei warmem Cache oft okay.
- Bei kaltem Start und schwachem Netz sind das extra Handshakes, extra Wartezeit und extra Ausfallstellen.

### 25.11 Die Haupt-App ist ein grosser Startblock

Code:

- `apps/menyra-social/social-app.js`
- Groesse aktuell: ca. `131 KB`
- `apps/menyra-social/styles/tailwind.generated.css`
- Groesse aktuell: ca. `44.6 KB`

Was passiert:

- Fast die ganze Hauptlogik haengt an einem grossen App-Modul.
- Echte Aufteilung fuer Gastpfade ist kaum da.
- Lazy-Loading gibt es fast nur fuer PWA und CRM.

Warum das schlecht ist:

- Jeder neue Gast laedt zuerst viel allgemeine Logik, auch wenn er nur QR, Feed oder Karte will.
- Das ist fuer schwaches Netz nicht ideal.

## 26. Was davon hilft heute scheinbar, schadet aber im Kern

Das sind die Punkte, die sich schnell anfuehlen sollen, aber strukturell oft neue Probleme erzeugen:

1. `FAST_MODE` plus Teil-Daten
   - schnell fuer warme Nutzer
   - aber keine harte Garantie fuer dieselbe Wahrheit

2. Bootstrap mit nur `120` Restaurants
   - schnell fuer den ersten Eindruck
   - aber gefaehrlich, wenn diese Teil-Liste wie die ganze Welt behandelt wird

3. Menue-Hybrid
   - robust gegen alte Datenformen
   - aber langsam und mehrdeutig auf dem Gastweg

4. Feed- oder Cache-Ersatzdaten im Profil
   - fuehlt sich schnell an
   - kann aber sichtbar spaeter korrigiert werden

5. Karten-Ersatzkoordinaten
   - sieht komplett aus
   - ist aber in Wahrheit schlimmer als fehlend

## 27. Die 7 schlimmsten Launch-Blocker nach Wirkung

Wenn ich hart sortiere, was heute am meisten Schaden machen kann, dann ist es diese Reihenfolge:

1. Karte darf falsche Koordinaten zeigen.
2. Menue startet erst zu spaet.
3. Menue-Lesen kann noch Schreibarbeit machen.
4. Restaurant-Wahrheit ist erst Teil-Liste und spaeter Voll-Liste.
5. Schnellstart stirbt bei schwachem Netz nach `1200ms`.
6. Feed, Profil und Story haben keine eine sichtbare Wahrheit.
7. Voller Restaurant-Load skaliert schlecht, wenn mehr Restaurantkunden kommen.

## 28. Harte Bewertung nach dieser Zusatzsuche

Nach dieser gezielten Blocker-Suche ist meine ehrliche Antwort:

- Das aktuelle `main` ist nicht "sorgenlos instant fuer alle".
- Es hat echte Substanz und viele Wege funktionieren warm schon ordentlich.
- Aber es hat noch mehrere Kern-Blocker, die fuer neue Gaeste, QR-Gaeste und schwaches Internet relevant sind.

Vor allem diese drei Dinge sprechen gegen "einfach sorgenlos publishen":

1. Menue ist noch nicht auf einem harten, direkten Gastpfad.
2. Karte ist noch nicht streng genug gegen falsche Standort-Wahrheit.
3. Restaurant-Daten sind noch nicht eine einzige sichtbare Wahrheit vom ersten Moment an.

Das ist die Stelle, an der Menyra heute mehr von Kernklarheit profitieren wuerde als von noch mehr kleinen UI- oder Speed-Fixes.
