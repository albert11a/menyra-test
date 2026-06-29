Status: CURRENT
Last updated: 2026-06-29
Branch: systemfix2027

# Firebase Data Flow Audit

## Scope und Regeln

Dieser Audit verbindet Firestore-Produktionsdaten, Firestore-Regeln und die
Ladepfade im Code. Production wurde nur gelesen. Es gab keine Firestore-Writes,
keine Deletes, keine Migration, keinen Rules- oder Functions-Deploy und keine
Smoke-/Playwright-Laeufe.

Gepruefte Quellen:

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `firestore.rules`
- Public-/Session-/CRM-/Lead-Code unter `apps/menyra-social/core/`
- Read-only Reports lokal unter:
  - `C:\mnyra-secrets\mnyra-systemfix2027-data-contract-audit-20260629.json`
  - `C:\mnyra-secrets\mnyra-systemfix2027-data-contract-dryrun-20260629.json`
  - `C:\mnyra-secrets\mnyra-systemfix2027-casarita-readonly-20260629.json`

## Kurzfazit

Firebase selbst wirkt nicht generell langsam oder kaputt. Die stabilen Bereiche
Feed, Restaurants und Shopping nutzen einfache, globale oder klar kanonische
Read-Pfade mit Cache-Fallbacks, die bei Fehlern keine sichtbare Fehlerseite
setzen.

Profil, Public Menu, Profil-Posts und QR/Menu sind komplexer: Sie laufen ueber
Slug, `publicRoutes`, Restaurant-ID, Public-Snapshot, persistenten Cache,
In-flight Requests, Retry-Pfade und teils mehrere moegliche IDs. Der beobachtete
Fehler `Menu konnte nicht geladen werden`, obwohl spaeter doch Daten erscheinen,
passt zu einem Ladezustandsproblem: Ein frueher `unknown`-/Timeout- oder
Prefetch-Zustand wurde als harter Fehler in den sichtbaren Public-Menu-State
uebernommen. Dieser kleine Code-Fix wurde sofort gemacht.

Casarita ist kein Beispiel fuer fehlende Menu-Daten: `publicRoutes/casarita`
zeigt auf `restaurants/Lzm6RpNu3ErSDtGCHxpi`; `public/menu` existiert, ist
`seeded` und enthaelt 39 Items. Auch `menuItems` enthaelt dort 39 Items.

## Firebase Map von Mnyra

| Collection / Pfad | Rolle | Wichtige Felder | Haupt-Codepfade |
| --- | --- | --- | --- |
| `leads/{leadId}` | CRM-/Akquise-Wahrheit fuer Leads | `status`, `businessName`, `customerType`, `createdByUid`, `ceoPath`, Kontaktfelder, Ortsfelder, Slug-/Landing-Felder, nach Conversion `restaurantId`, `socialUid` | `core/leads/lead-save-utils.js`, `core/leads/lead-convert-utils.js`, `core/crm/crm-admin-read-loader-core.js` |
| `restaurants/{restaurantId}` | Kanonisches Business-/Restaurant-Profil und Public-Identity | `name`, `restaurantName`, `type`, `status`, `publicSlug`, `landingSlug`, `canonicalPublicPath`, `ownerUid`, `ownerEmail`, `leadId`, Medien, Farben, Orte | `session-data-runtime-controller.js`, `public-profile-runtime-controller.js`, `public-bootstrap-runtime-controller.js`, Lead-Conversion |
| `publicRoutes/{slug}` | Slug-Index fuer Public Routes | `slug`, `restaurantId`, `status`, `routeType`, Snapshot-Felder, optional `menu`/`focus`-Summary | `core/router/public-route-doc-reader.js`, `core/router/public-business-route-resolver.js`, Public Profile Resolver |
| `restaurants/{rid}/public/menu` | Guest-facing Menu-Wahrheit | `items[]`, `menuTruthSource`, `menuTruthState`, `updatedAt`, `statusBadgeVisible` | `core/menu/menu-public-runtime-controller.js`, `session-data-runtime-controller.js`, Public Profile/Menu Renderer |
| `restaurants/{rid}/menuItems/{itemId}` | Legacy-/Editor-/interner Menu-Pfad | Item-Daten je Dokument | `core/menu/menu-public-runtime-controller.js` fuer Editor/Hybrid/Migration, nicht als Guest-Wahrheit |
| `restaurants/{rid}/public/offers` | Public Focus-/Travel-/Shopping-Angebote | `items[]`, `truthSource`, `truthState`, `updatedAt` | `session-data-runtime-controller.js`, Focus-/Shopping-/Travel-Pfade |
| `restaurants/{rid}/public/meta` | Public-Meta fuer Profil/Route | Snapshot-/Meta-Felder | `ensureRestaurantPublicMeta(...)` in Lead-/Restaurant-Pfaden |
| `restaurants/{rid}/socialPosts/{postId}` | Profil-Beitraege eines Businesses | `restaurantId`, `status`, Medien-/Caption-Felder, `createdAt` | `public-profile-runtime-controller.js`, `session-data-runtime-controller.js` |
| `socialFeed/{postId}` | Globaler Feed-Index | `restaurantId`, `status`, `createdAt`, Medien-/Caption-Felder | `loadFeedPosts(...)` in `session-data-runtime-controller.js` |
| `restaurants/{rid}/stories/{storyId}` | Restaurant Stories | Story-Medien, Status, Zeitfelder | Story-Loader/Firestore-Regeln |
| `users/{uid}` | Auth-/Rollen-/Account-Wahrheit | `uid`, `role`, `roles`, `status`, `restaurantId`, Business-/Profilfelder | Auth/Profile/CRM/Conversion |
| `restaurants/{rid}/staff/{uid}` | BusinessAccounts / Staff je Restaurant | Staff-Rolle, Restaurant-Link, Account-Metadaten | `core/crm/crm-business-account-read-loader-core.js` |
| `users/{uid}/posts` | Aelterer oder usernaher Post-Pfad | Post-Daten je User | Wird noch gefunden, aber nicht als stabile Public-Profil-Wahrheit bewertet |
| `orders`, `orderLookup`, User-Subcollections | Checkout-/User-Flows | out of scope fuer diesen Audit | Firestore-Regeln und App-Code, keine Production-Schreibtests |
| `superadmins`, `staffAdmins`, `staffIndex` | Admin-/Staff-Rechte | Admin- und Staff-Indizes | Regeln/Admin-Code |

## Welche Daten ein Lead haben muss

Ein Lead braucht mindestens:

- stabile Lead-ID als Dokument-ID
- `status` mit Lead-/CRM-Zustand, vor Conversion nicht `kunde`
- Business-Identitaet: `businessName` oder `restaurantName`, `customerType`/`type`
- Kontakt: Ansprechpartner, Telefon, Email oder Social-Kontakt, soweit vorhanden
- Scoping: `createdByUid` und/oder `ceoPath`
- Ort: `city`, `address`, optional `lat`/`lng`, `locations`
- Public-Vorbereitung: `publicSlug`/`landingSlug` oder genug Felder, um einen
  stabilen Slug abzuleiten
- Nach Aktivierung/Conversion: `restaurantId`, `landingRestaurantId`,
  `canonicalPublicPath`, `landingPageUrl`, optional `socialUid`/`socialEmail`,
  `convertedAt`

Leads sind nicht die Public-Wahrheit. Sie duerfen fehlende Public-Felder haben,
solange die Conversion daraus einen vollstaendigen Restaurant-/User-/Public-Meta-
Vertrag erzeugt.

## Welche Daten ein echtes Restaurant / Business-Profil haben muss

Ein aktiv nutzbares Business-Profil braucht mindestens:

- Dokument-ID als kanonische `restaurantId`
- `name` und/oder `restaurantName`
- `type`/`customerType`
- `status`
- `publicSlug`, `landingSlug`, `canonicalPublicPath`
- fuer echte Accounts: `ownerUid`, `ownerEmail` und passendes `users/{uid}` mit
  `restaurantId`
- Public-Medien: Logo/Cover/Titelbild, soweit das Profil sichtbar ist
- Ort: Stadt/Adresse/Koordinaten/Locations, soweit fuer Listen/Map relevant
- Guest Menu unter `restaurants/{rid}/public/menu`, wenn das Profil Menu zeigen
  soll
- Profil-Beitraege unter `restaurants/{rid}/socialPosts`, wenn das Profil
  Beitraege zeigen soll
- Route unter `publicRoutes/{slug}`, wenn das Profil oeffentlich per Slug
  erreichbar sein soll

## Lead -> Restaurant Ablauf

1. Lead wird ueber `lead-save-utils.js` gespeichert. Der Lead enthaelt CRM-,
   Kontakt-, Orts-, Medien- und Slug-Informationen.
2. `lead-identity-contract-utils.js` versucht, eine stabile Restaurant-Identitaet
   zu bewahren: vorhandene `restaurantId`, `landingRestaurantId`,
   `restaurantDocId` oder ein Restaurant mit passender `leadId` haben Vorrang.
3. `lead-convert-utils.js` baut daraus ein Restaurant-Payload:
   Business-Namen, Typ, Ort, Medien, Status, `leadId`, Slug, Public-Pfad,
   optional `ownerUid`/`ownerEmail`/`ownerName`.
4. `restaurants/{restaurantId}` wird per Merge gesetzt.
5. `ensureRestaurantPublicMeta(...)` erzeugt/aktualisiert Public-Meta.
6. Falls `socialUid` vorhanden ist, wird `users/{socialUid}` als Business-User
   mit `restaurantId`, `role: business`, `status: active` und Profilfeldern
   gebootstrappt.
7. `leads/{leadId}` wird auf Kunden-/Conversion-Zustand aktualisiert und mit
   Restaurant-/Landing-/Social-Feldern verbunden.

Wichtig: Dieser Ablauf ist nicht nur eine Datenkopie. Er ist der Vertrag
zwischen CRM-Lead, Restaurant-Dokument, User-Dokument und Public-Oberflaeche.
Fehlt `ownerUid` oder passt `users/{uid}.restaurantId` nicht zum Restaurant,
koennen Owner-/Editor-/Profilpfade instabil werden, auch wenn die Public Route
noch funktioniert.

## Restaurant -> Profil / Menu / Posts Ablauf

Public Profil:

1. URL-Slug oder direkter Token wird aufgeloest.
2. Der Resolver prueft direktes Restaurant-Dokument, `publicRoutes/{slug}` und
   Restaurant-Queries auf `publicSlug`, `landingSlug` und `handle`.
3. Aus Route, Restaurant und Bootstrap-Snapshot wird der sichtbare
   Public-Profile-State gebaut.
4. Der Profile/Menu-Orchestrator laedt sichtbare Menu-IDs: requested ID, Route-
   Restaurant-ID und kanonische Restaurant-ID koennen nacheinander beteiligt
   sein.

Public Menu:

1. Guest-facing Wahrheit ist `restaurants/{rid}/public/menu`.
2. `restaurants/{rid}/menuItems` ist Legacy-/Editor-/Migrationspfad und darf
   nicht blind als Public-Wahrheit gelten.
3. Der Session-Loader nutzt Memory Cache, persistenten Cache, In-flight
   Requests und Firebase-Reads.
4. Public-Menu-State wird aus `items`, `loading`, `error`, `truthState`,
   Route-Seed und Restaurant-ID abgeleitet.

Profil-Posts:

1. Profil-Beitraege laden aus `restaurants/{rid}/socialPosts`.
2. Feed laedt dagegen aus `socialFeed`.
3. Dadurch kann der globale Feed stabil sein, waehrend das Profil bei falscher
   Restaurant-ID, Slug-Aufloesung oder ungeeigneter Post-Normalisierung anders
   wirkt.

## Warum Feed / Restaurants / Shopping stabiler sind

- `loadRestaurants(...)` liest die globale `restaurants`-Collection, setzt
  vorhandenen Cache sofort und reconciled im Hintergrund. Fehler loeschen den
  vorhandenen Zustand nicht sichtbar.
- `loadFeedPosts(...)` liest `socialFeed` mit `status == active`, sortiert nach
  `createdAt` und faellt bei Query-Problemen auf eine einfachere Query zurueck.
  Restaurant-Hydration laeuft danach getrennt.
- Shopping/Focus liest strukturierte Public-Angebote und kann Listen auch ohne
  Profil-Slug-Orchestrierung anzeigen.
- Diese Bereiche haengen nicht am Zusammenspiel aus Route-Slug, Route-Snapshot,
  kanonischer Restaurant-ID, Menu-Cache und sichtbarem Public-Menu-Renderer.

## Warum Public Profil / Menu / QR / Beitraege instabiler sind

- Ein Public-Profil kann mit Slug, Restaurant-ID, Route-ID oder Alias starten.
- `publicRoutes/{slug}` kann einen Snapshot liefern, aber nicht zwingend die
  eigentlichen Menu-Items.
- Menu kann erst aus Cache kommen, dann aus `public/menu`, waehrend ein
  kanonischer Restaurant-ID-Load nachzieht.
- Prefetch- und sichtbare Loads teilen sich In-flight Requests.
- Ein `unknown`-Ergebnis darf nicht wie ein finaler Fehler aussehen, solange
  Retry oder kanonischer Load noch laufen.
- Profil-Posts nutzen `restaurants/{rid}/socialPosts`, der Feed nutzt
  `socialFeed`; falsche ID oder strengere Normalisierung kann nur das Profil
  treffen.

## Datenbefunde

Produktionsaudit, read-only:

- `users`: 126 gesampelt
- `restaurants`: 141 auditiert
- `publicRoutes`: 139
- `socialFeed`: 58 Dokumente
- Restaurants mit `socialPosts`: 19
- Restaurants mit Legacy-`menuItems`: 24
- `publicRoutes` zeigen im Audit alle `status: lead`
- `slugRestaurantMismatchCount`: 0
- `routesPointingToMissingRestaurantsCount`: 0
- `publicMenuBackfillNeededCount`: 0

| Risiko / Befund | Collection / Feld | Beispiel-Dokumente / IDs | Ursache | Sichtbarer Effekt | Exakter Fixvorschlag |
| --- | --- | --- | --- | --- | --- |
| Casarita ist datenmaessig ok | `publicRoutes`, `restaurants`, `public/menu`, `menuItems` | `publicRoutes/casarita`, `restaurants/Lzm6RpNu3ErSDtGCHxpi` | Public Menu existiert und ist `seeded`; 39 Items in `public/menu` und 39 in `menuItems` | Wenn dort kurz `Menu konnte nicht geladen werden` erscheint, ist das ein Ladezustands-/Race-Problem, kein fehlendes Menu | Keine Datenmigration fuer Casarita; Loader-State fixen und beobachten |
| Public Menu fehlt/ist leer bei vielen Restaurants, aber ohne Legacy-Daten | `restaurants/{rid}/public/menu` | 88 missing/empty, davon 43 ohne Public-Menu-Dokument | Viele Leads/Restaurants haben schlicht kein Public Menu | Leere Menus koennen korrekt sein; duerfen nicht blind mit Legacy-Daten gefuellt werden | Vor Migration Produktentscheidung: welche Leads/Restaurants sollen ein bekannt leeres Public Menu bekommen |
| Public Menu vs Legacy MenuItems weicht ab | `public/menu.items`, `menuItems` | `restaurants/CiLBuUs4R71wqFCyzCFu`: Public 2 Items, Legacy 1 Item | Zwei Menu-Wahrheiten existieren parallel | Editor/Public koennen unterschiedliche Menus zeigen | Manuell vergleichen, Public-Wahrheit bestaetigen, danach gezielte Bereinigung/Migration nach Backup |
| Public-Menu-Metadaten fehlen | `public/menu.menuTruthSource`, `public/menu.menuTruthState` | 74 Public-Menu-Dokumente | Aeltere Datenform ohne Truth-Metadaten | Loader kann leer/unknown/seeded schlechter unterscheiden | Migration nach Backup: `menuTruthSource: public-menu`, `menuTruthState: seeded` oder `knownEmpty`, `updatedAt` setzen |
| Public-Offers-Metadaten fehlen | `public/offers.truthSource`, `public/offers.truthState` | 67 Offers-Dokumente | Aeltere Datenform ohne Truth-Metadaten | Focus/Shopping/Travel kann schwer zwischen bekannt leer und nicht geladen unterscheiden | Migration nach Backup/Staging mit klarer Truth-State-Regel |
| Focus ohne Menu | `public/offers`, `public/menu` | `restaurants/7IlioiC6zvTB1F1hG2hj`, `restaurants/GpJOfqAXQVGk2DQUYhkw` | Offers vorhanden, Menu fehlt/leer | Profil kann Focus-/Angebotsdaten haben, aber Menu bleibt leer | Produktlich entscheiden, ob diese Businesses Menu brauchen; nicht automatisch auffuellen |
| Public Route fehlt fuer geloeschtes Restaurant | `publicRoutes/{slug}` | `restaurants/Oas88BarpewjKe3ALmPj`, slug `casa-mora`, Status `deleted` | Route fuer geloeschten Datensatz nicht vorhanden | Direkter Slug kann nicht routen, vermutlich korrekt bei deleted | Keine Auto-Erstellung; zuerst Klaerung, ob deleted oeffentlich inaktiv routen soll |
| Restaurants ohne Owner | `restaurants.ownerUid` | `6kV8TXtWRMHSYtgXuySO`, `7QHlfQfM78004L0eawQM`, `Al1tz1uIoHBCLyg6CxDu`, `BsNO0h2HwkarPvZ7jZHr`, `Oas88BarpewjKe3ALmPj`, `VH4YQ4ktjafuTLb2LgaW`, `WBCXcgthTFjiSGWR1RTF` | Lead-/Referenzdaten ohne aktiven Business-Owner | Public kann funktionieren, Owner-Dashboard/Edit/Account aber nicht | Manuelle Ownership-Pruefung vor Backfill |
| Owner-Relationen nicht im User-Sample auffindbar | `restaurants.ownerUid`, `users/{uid}` | 35 Review-Faelle im Dry-run | OwnerUid referenziert keinen auditierten User oder User liegt ausserhalb Erwartung | Auth-/Owner-Tools koennen inkonsistent sein | Vollstaendiger Auth/User/Restaurant-Join in Staging/Backup-Kontext |
| User zeigt auf Restaurant, dessen Owner abweicht | `users.restaurantId`, `restaurants.ownerUid` | `users/otweEmCUDYdNBxXGilQjjp64lU62` -> `Lzm6RpNu3ErSDtGCHxpi`, Restaurant ownerUid `XTn4oQqz3zdNiedL7MafwzDgus32` | User/Restaurant-Verknuepfung nicht eindeutig Owner | Account kann als Business verlinkt wirken, ohne Owner zu sein | Klaeren: Staff, alter Owner oder falscher Link; danach gezielt korrigieren |
| Malformed User-Dokument | `users/{docId}`, `uid` | Dokument-ID beginnt mit `.fieldPaths=uid&updateMask...`, `uidField: NRMUjdDonyUeQtozzAlIF9Qsecq1` | Vermutlich alter fehlerhafter Write/REST-Call | Admin-/User-Listen koennen Sonderfall sehen | Nach Backup dokumentiert loeschen oder archivieren, nicht blind |
| User ohne `status` | `users.status` | 60 User im Sample | Aeltere User-Datenform | Rollen-/Aktivierungslogik kann je nach Pfad abweichen | Status-Backfill nach expliziter Regel `active`/`inactive`/`lead` |
| PublicRoute-Status bleibt `lead` | `publicRoutes.status` | 139 PublicRoutes im Audit | Route-Status wird offenbar nicht als aktive Business-Wahrheit gepflegt | Resolver routet `lead`, aber Admin-/Analyse-Status kann irrefuehrend sein | Status-Vertrag definieren, dann Migration; keine Routing-Aenderung ohne Freigabe |

## Konkrete Codeprobleme beim Laden

| Prioritaet | Bereich | Problem | Effekt | Status / Fix |
| --- | --- | --- | --- | --- |
| P0 | Public Menu In-flight | Ein sichtbarer Public-Menu-Load konnte ein bereits laufendes `unknown`-/Prefetch-Ergebnis als `error` uebernehmen | Kurz `Menu konnte nicht geladen werden`, danach erscheinen Daten | Gefixt in `session-data-runtime-controller.js`; Test ergaenzt |
| P1 | Public Menu Error Branch | Der sichtbare Catch-Pfad kann weiterhin einen echten Fehler setzen, obwohl ein spaeter Retry oder kanonischer ID-Load noch laufen kann | Fehlertext kann zu frueh final wirken | Fehler erst final setzen, wenn kanonische Restaurant-ID stabil ist und kein Retry/In-flight/valid cache mehr offen ist |
| P1 | Alias vs kanonische Restaurant-ID | Profil-Orchestrator laedt requested ID, Route-ID und kanonische ID; alte Alias-Zustaende muessen konsequent nicht gewinnen | Kurz falsches leer/unknown/error auf Profil/Menu | Request-Token oder canonical-wins-Regel fuer Error- und Empty-State verschaerfen |
| P1 | Profil-Posts | Profil liest `restaurants/{rid}/socialPosts`, Feed liest `socialFeed`; Profil filtert normalisierte Posts strenger | Feed kann stabil wirken, Profil-Beitraege fehlen oder kommen spaeter | Post-Vertrag pruefen: text-only/caption-only Posts nicht versehentlich verwerfen |
| P2 | Bootstrap-Snapshot | `publicRoutes`/Bootstrap koennen Menu-Count/Truth liefern, aber nicht die Items | UI braucht danach immer noch `public/menu` | Nur als Snapshot behandeln; keine finale Menu-Aussage ohne Public-Menu-Read |
| P2 | Persistenter Cache | Menu-/Post-/Restaurant-Caches koennen kurz alten Zustand zeigen, bis Firestore reconciled | Kurz alter/leer wirkender Zustand | Cache mit `updatedAt`/Truth-State strenger invalidieren, aber nur nach stabiler Datenregel |

## Sofort sicher gemachte Fixes

Gemacht:

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - In-flight `unknown` fuer sichtbares Public Menu bleibt jetzt `loading: true`
    und `truthState: unknown`.
  - Es wird kein sichtbarer Fehlertext mehr gesetzt, nur weil ein laufender
    Prefetch/Timeout noch kein finales Ergebnis hat.
- `tests/session-data-menu-focus-no-hang.test.mjs`
  - Neuer Test: sichtbarer Public-Menu-Load darf ein laufendes
    `unknown`-Prefetch-Ergebnis nicht als Error uebernehmen.

Verifiziert:

- `node --test tests\session-data-menu-focus-no-hang.test.mjs`
- Ergebnis: 7/7 Tests bestanden.

Nicht gemacht:

- keine UI-/Design-Aenderung
- keine Datenmigration
- keine Firestore-Writes
- keine Deletes
- kein Rules-/Functions-Deploy
- keine Smoke-/Playwright-Laeufe

## Fixes erst nach Backup / Staging / Migration

P0/P1 vor Production-Mutation klaeren:

- Public-Menu-Truth-Metadaten fuer 74 Dokumente backfillen.
- Public-Offers-Truth-Metadaten fuer 67 Dokumente backfillen.
- `restaurants/CiLBuUs4R71wqFCyzCFu` manuell vergleichen und Public-vs-Legacy-
  Menu-Wahrheit festlegen.
- Restaurants ohne `ownerUid` pruefen und nur mit bestaetigter Ownership
  korrigieren.
- 35 Owner-/User-Relationen pruefen, nicht automatisch reparieren.
- `users/otweEmCUDYdNBxXGilQjjp64lU62` klaeren: Staff, alter Owner oder
  falscher Business-Link.
- Malformed `users/.fieldPaths=...`-Dokument nach Backup gezielt behandeln.
- User-Status-Migration fuer 60 User erst nach klarer Status-Regel.
- `publicRoutes.status`-Vertrag definieren, bevor `lead`/`active`/`inactive`
  migriert wird.
- Fehlende Public-Menu-Dokumente nicht blind erzeugen; zuerst entscheiden,
  ob `knownEmpty` fuer alle menu-losen Leads/Restaurants gewollt ist.

## Priorisierte Fixliste

P0:

- Falschen Public-Menu-In-flight-Error entfernen. Erledigt.
- Bei erneutem Auftreten konkrete Route/Restaurant-ID loggen: requested ID,
  route restaurantId, canonical restaurantId, cache hit, public/menu result,
  final visible state.

P1:

- Canonical-wins-Regel fuer Public-Menu-Error/Empty-State haerter machen.
- Profil-Posts-Vertrag gegen Feed-Vertrag pruefen und text-only/caption-only
  Posts sauber behandeln.
- Public-Menu-/Offers-Truth-Metadaten als Staging-Migration vorbereiten.
- Owner-/Business-Account-Relationen vor Aktivierungs-/Account-Fixes auditieren.

P2:

- Cache-Invalidierung mit `updatedAt`/Truth-State vereinheitlichen.
- `publicRoutes`-Snapshot-Felder als reine Hints dokumentieren, nicht als finale
  Menu-Wahrheit.
- Alte `menuItems`-Daten nach bestaetigter Public-Wahrheit archivieren oder als
  Editor-Only-Vertrag festschreiben.

## Manuelle Testliste

Ohne Production-Schreibaktionen:

1. `/casarita` hart laden.
2. `/casarita/menu` hart laden.
3. Direkt nach dem Laden beobachten, ob kurz `Menu konnte nicht geladen werden`
   erscheint.
4. Zwischen Profil und Menu wechseln.
5. Beitraege-Tab oeffnen und pruefen, ob Profil-Beitraege stabil erscheinen.
6. Einen Restaurant-Listenpfad und Feed daneben oeffnen und vergleichen, ob nur
   Profil/Menu betroffen ist.
7. Browser-Console nur lesen, keine QR-/Order-/Checkout-Schreibflows ausfuehren.
