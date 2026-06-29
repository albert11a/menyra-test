Status: CURRENT
Last updated: 2026-06-29
Branch: systemfix2027

# Firebase Data Flow Audit

## Scope und Abdeckung

Dieser Audit verbindet Firestore-Produktionsdaten, Firestore-Regeln und die
Ladepfade im Code. Production wurde nur gelesen. Es gab keine Firestore-Writes,
keine Deletes, keine Migration, keinen Rules- oder Functions-Deploy und keine
Smoke-/Playwright-Laeufe.

Primaere Quelle ist der komplette Read-only-Inventarlauf:

- Script: `functions/scripts/audit-mnyra-complete-data-flow-readonly.cjs`
- Report: `C:\mnyra-secrets\mnyra-systemfix2027-complete-data-flow-audit-20260629.json`
- Ergebnis: `warnings=0`, `issues=222`, keine Production-Mutation

Ergaenzende Read-only-/Dry-run-Reports:

- `C:\mnyra-secrets\mnyra-systemfix2027-data-contract-audit-20260629.json`
- `C:\mnyra-secrets\mnyra-systemfix2027-data-contract-dryrun-20260629.json`
- `C:\mnyra-secrets\mnyra-systemfix2027-casarita-readonly-20260629.json`

Zusaetzlich geprueft:

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `firestore.rules`
- Public-/Session-/CRM-/Lead-Code unter `apps/menyra-social/core/`

## Was komplett gelesen wurde

Der Complete-Run hat nicht nur Casarita gelesen, sondern die relevanten
Produktions-Collections und Subcollections vollstaendig inventarisiert:

| Bereich | Anzahl |
| --- | ---: |
| Top-Level Collections | 12 |
| `leads` | 135 |
| `restaurants` | 141 |
| `publicRoutes` | 139 |
| `users` | 126 |
| `socialFeed` | 58 |
| `users/*/posts` | 63 Posts in 3 User-Post-Collections |
| `restaurants/*/public/menu` | 98 Public-Menu-Dokumente |
| Public Menus mit Items | 53 |
| Public Menus missing/empty | 88 Restaurants |
| `restaurants/*/menuItems` | 24 Restaurants, 391 Items gesamt |
| Legacy MenuItems ohne Public Menu | 0 |
| Public-vs-Legacy-Menu-Count-Mismatch | 1 |
| `restaurants/*/public/offers` mit Items | 14 |
| Offers/Focus ohne Menu | 2 |
| Restaurants mit `socialPosts` | 19 |
| `restaurants/*/socialPosts` | 58 |
| Restaurants mit `stories` | 10 |
| `restaurants/*/stories` | 37 |
| Restaurants mit `staff` | 10 |
| `restaurants/*/staff` | 13 |

Gefundene Top-Level-Collections:

- `chats`
- `heartIncidents`
- `heartRuns`
- `heartSetup`
- `leads`
- `publicRoutes`
- `restaurants`
- `socialFeed`
- `staffAdmins`
- `staffIndex`
- `superadmins`
- `users`

Gefundene Restaurant-Subcollections:

- `public` bei 141 Restaurants
- `menuItems` bei 24 Restaurants
- `socialPosts` bei 20 Restaurants, davon 19 mit Posts
- `staff` bei 10 Restaurants
- `stories` bei 10 Restaurants
- `orders` bei 10 Restaurants
- `menuSocial` bei 7 Restaurants
- `offers` bei 2 Restaurants
- `calls` bei 1 Restaurant

Gefundene User-Subcollections:

- `notifications` bei 23 Users
- `devices` bei 20 Users
- `chatThreads` bei 15 Users
- `following` bei 15 Users
- `menuFavorites` bei 7 Users
- `orders` bei 4 Users
- `posts` bei 3 Users
- `followRequests` bei 2 Users
- `followRequestsOut` bei 2 Users

## Kurzfazit

Firebase selbst wirkt nicht generell langsam oder kaputt. Es gibt aber mehrere
historische Datenformen, die genau die Profile/Menu/Posts-Flows riskanter machen
als Feed, Restaurants und Shopping.

Die wichtigsten Datenbefunde:

- Alle 141 Restaurants wurden gegen PublicRoutes, Public Menu, Legacy MenuItems,
  Offers, SocialPosts, Stories und Staff inventarisiert.
- Es gibt keinen breiten Fall `menuItems hat Daten, public/menu fehlt`: Count
  `0`. Das spricht gegen eine simple Menu-Migration als Ursache des sichtbaren
  Ladefehlers.
- Es gibt 1 echten Public-vs-Legacy-Menu-Mismatch:
  `restaurants/CiLBuUs4R71wqFCyzCFu` hat `public/menu` mit 2 Items und
  `menuItems` mit 1 Item.
- 74 Public-Menu-Dokumente haben keine Truth-Metadaten; 30 davon enthalten
  Items. Das ist ein Ladezustandsrisiko.
- 67 Offers-Dokumente haben keine Truth-Metadaten; 1 davon enthaelt Items.
- 2 Restaurants haben Offers/Focus, aber kein Menu:
  `7IlioiC6zvTB1F1hG2hj`, `GpJOfqAXQVGk2DQUYhkw`.
- 1 converted Lead nutzt den alten Link `convertedRestaurantId`, aber nicht den
  kanonischen `restaurantId`/`landingRestaurantId`:
  `leads/oEE6EVr3g3HCJZyZGgQf`.
- 7 Restaurants haben gar kein `ownerUid`.
- Weitere 35 Restaurants haben ein `ownerUid`, das im kompletten
  `users`-Bestand nicht als `users/{uid}` existiert. Zusammen sind das 42
  Owner-Link-Risiken.
- 63 alte `users/*/posts` haben keinen Restaurant-Link. Diese sind nicht
  gleichwertig zu `restaurants/*/socialPosts`.

Die wichtigsten Codebefunde:

- Feed, Restaurants und Shopping nutzen einfachere, globale oder klar
  kanonische Read-Pfade und setzen bei Fehlern keinen sichtbaren finalen
  Fehlerzustand.
- Public Profil/Menu/Posts laufen ueber Slug, `publicRoutes`, Route-Snapshot,
  kanonische Restaurant-ID, Cache, In-flight Requests und Retry-Pfade.
- Ein sichtbarer Public-Menu-Load konnte ein laufendes `unknown`-/Prefetch-
  Ergebnis als `error` uebernehmen. Dieser Codefehler wurde sofort behoben.

Casarita ist nur ein verifizierter Einzelfall, nicht der Umfang dieses Audits:
`publicRoutes/casarita` zeigt auf `restaurants/Lzm6RpNu3ErSDtGCHxpi`;
`public/menu` ist `seeded` mit 39 Items, `menuItems` hat ebenfalls 39 Items.
Wenn dort kurz `Menu konnte nicht geladen werden` erscheint, ist das kein
fehlendes Menu-Dokument, sondern ein Ladezustands-/Race-Problem.

## Firebase Map von Mnyra

| Collection / Pfad | Rolle | Wichtige Felder | Haupt-Codepfade |
| --- | --- | --- | --- |
| `leads/{leadId}` | CRM-/Akquise-Wahrheit fuer Leads | `status`, `businessName`, `customerType`, `createdByUid`, `ceoPath`, Kontaktfelder, Ortsfelder, Slug-/Landing-Felder, nach Conversion `restaurantId`, `landingRestaurantId`, `socialUid` | `core/leads/lead-save-utils.js`, `core/leads/lead-convert-utils.js`, `core/crm/crm-admin-read-loader-core.js` |
| `restaurants/{restaurantId}` | Kanonisches Business-/Restaurant-Profil und Public-Identity | `name`, `restaurantName`, `type`, `status`, `publicSlug`, `landingSlug`, `canonicalPublicPath`, `ownerUid`, `ownerEmail`, `leadId`, Medien, Farben, Orte | `session-data-runtime-controller.js`, `public-profile-runtime-controller.js`, `public-bootstrap-runtime-controller.js`, Lead-Conversion |
| `publicRoutes/{slug}` | Slug-Index fuer Public Routes | `slug`, `restaurantId`, `status`, `routeType`, Snapshot-Felder, optional `menu`/`focus`-Summary | `core/router/public-route-doc-reader.js`, `core/router/public-business-route-resolver.js`, Public Profile Resolver |
| `restaurants/{rid}/public/menu` | Guest-facing Menu-Wahrheit | `items[]`, `menuTruthSource`, `menuTruthState`, `updatedAt`, `statusBadgeVisible` | `core/menu/menu-public-runtime-controller.js`, `session-data-runtime-controller.js`, Public Profile/Menu Renderer |
| `restaurants/{rid}/menuItems/{itemId}` | Legacy-/Editor-/interner Menu-Pfad | Item-Daten je Dokument | `core/menu/menu-public-runtime-controller.js` fuer Editor/Hybrid/Migration, nicht als Guest-Wahrheit |
| `restaurants/{rid}/public/offers` | Public Focus-/Travel-/Shopping-Angebote | `items[]`, `truthSource`, `truthState`, `updatedAt` | `session-data-runtime-controller.js`, Focus-/Shopping-/Travel-Pfade |
| `restaurants/{rid}/public/meta` | Public-Meta fuer Profil/Route | Snapshot-/Meta-Felder | `ensureRestaurantPublicMeta(...)` in Lead-/Restaurant-Pfaden |
| `restaurants/{rid}/socialPosts/{postId}` | Profil-Beitraege eines Businesses | `restaurantId`, `status`, Medien-/Caption-Felder, `createdAt` | `public-profile-runtime-controller.js`, `session-data-runtime-controller.js` |
| `socialFeed/{postId}` | Globaler Feed-Index | `restaurantId`, `rid`, `status`, `createdAt`, Medien-/Caption-Felder | `loadFeedPosts(...)` in `session-data-runtime-controller.js` |
| `restaurants/{rid}/stories/{storyId}` | Restaurant Stories | Story-Medien, Status, Zeitfelder | Story-Loader/Firestore-Regeln |
| `users/{uid}` | Auth-/Rollen-/Account-Wahrheit | `uid`, `role`, `roles`, `status`, `restaurantId`, Business-/Profilfelder | Auth/Profile/CRM/Conversion |
| `restaurants/{rid}/staff/{uid}` | BusinessAccounts / Staff je Restaurant | Staff-Rolle, Restaurant-Link, Account-Metadaten | `core/crm/crm-business-account-read-loader-core.js` |
| `users/{uid}/posts` | Aelterer oder usernaher Post-Pfad | Post-Daten je User | Nicht stabile Public-Profil-Wahrheit; 63 Posts ohne Restaurant-Link gefunden |
| `orders`, `orderLookup`, User-Orders | Checkout-/User-Flows | out of scope fuer Schreibtests | Firestore-Regeln und App-Code, keine Production-Schreibtests |
| `superadmins`, `staffAdmins`, `staffIndex` | Admin-/Staff-Rechte | Admin- und Staff-Indizes | Regeln/Admin-Code |

## Welche Daten ein Lead haben muss

Ein Lead braucht mindestens:

- stabile Lead-ID als Dokument-ID
- `status` mit Lead-/CRM-Zustand
- Business-Identitaet: `businessName` oder `restaurantName`, `customerType`/`type`
- Kontakt: Ansprechpartner, Telefon, Email oder Social-Kontakt, soweit vorhanden
- Scoping: `createdByUid` und/oder `ceoPath`
- Ort: `city`, `address`, optional `lat`/`lng`, `locations`
- Public-Vorbereitung: `publicSlug`/`landingSlug` oder genug Felder, um einen
  stabilen Slug abzuleiten
- Nach Aktivierung/Conversion: `restaurantId`, `landingRestaurantId`,
  `canonicalPublicPath`, `landingPageUrl`, optional `socialUid`/`socialEmail`,
  `convertedAt`

Gefundene Lead-Verteilung:

- `registered`: 132
- `testphase`: 2
- `converted`: 1

Gefundene Lead-Risiken:

- `leads/oEE6EVr3g3HCJZyZGgQf` ist `converted`, hat aber kein kanonisches
  `restaurantId`/`landingRestaurantId`; es nutzt `convertedRestaurantId` auf ein
  existierendes Restaurant (`vZOFF4pAyrCh6QNOo2ef`). Das ist ein alter Feldname
  und kann von Codepfaden uebersehen werden, die nur `restaurantId` oder
  `landingRestaurantId` lesen.
- Derselbe Lead hat kein `createdByUid`/`ceoPath`; scoped CRM-Reads koennen ihn
  anders behandeln.

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

Gefundene Restaurant-Verteilung:

- `lead`: 132
- `testphase`: 2
- `deleted`: 7

Gefundene Restaurant-Typen:

- `restaurant`: 96
- `fastfood`: 16
- `cafe`: 13
- `ecommerce`: 7
- `hotel`: 6
- `motel`: 1
- `services`: 1
- `apotheken`: 1

## Unterschiede der Datenformen

| Datenform | Wahrheit fuer | Nicht verwechseln mit |
| --- | --- | --- |
| Lead | CRM-/Akquise-Zustand | Public Profil |
| Restaurant | kanonische Business-/Public-Identitaet | Lead-Entwurf |
| PublicRoute | Slug -> Restaurant-ID | komplettes Profil/Menu |
| Public Menu | Guest-facing Menu | Legacy `menuItems` |
| MenuItems | Editor/Legacy/Migration | Public-Gastansicht |
| SocialPosts | Profil-Beitraege | Globaler Feed-Index |
| SocialFeed | Feed-Projektion | Profil-Post-Wahrheit |
| Stories | Story-Oberflaeche | Posts |
| Staff | BusinessAccounts/Waiter/Owner-Beziehungen | `users.role` allein |
| UserPosts | alter/usernaher Post-Pfad | Restaurant-Profil-Posts |

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

Wichtig: Der alte Lead-Feldname `convertedRestaurantId` wird in mehreren
aktuellen Codepfaden nicht als primaerer Link genutzt. Converted Leads sollten
nach Backup auf `restaurantId`/`landingRestaurantId` normalisiert werden.

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
3. Alte `users/{uid}/posts` sind eine separate Datenform und haben im Complete-
   Run keinen Restaurant-Link. Sie duerfen nicht als Ersatz fuer Profil-Posts
   behandelt werden.

## Feed / Restaurants / Shopping vs Profil / Menu

Warum Feed, Restaurants und Shopping stabiler sind:

- `loadRestaurants(...)` liest die globale `restaurants`-Collection, setzt
  vorhandenen Cache sofort und reconciled im Hintergrund. Fehler loeschen den
  vorhandenen Zustand nicht sichtbar.
- `loadFeedPosts(...)` liest `socialFeed` mit `status == active`, sortiert nach
  `createdAt` und faellt bei Query-Problemen auf eine einfachere Query zurueck.
  Restaurant-Hydration laeuft danach getrennt.
- Shopping/Focus liest strukturierte Public-Angebote und kann Listen auch ohne
  Profil-Slug-Orchestrierung anzeigen.

Warum Public Profil, Menu, QR/Menu und Beitraege instabiler sind:

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

## Kaputte oder riskante Datenformen

| Risiko / Befund | Collection / Feld | Betroffene Dokumente / IDs | Ursache | Sichtbarer Effekt | Exakter Fixvorschlag |
| --- | --- | --- | --- | --- | --- |
| Converted Lead nutzt alten Link | `leads.convertedRestaurantId` statt `restaurantId`/`landingRestaurantId` | `leads/oEE6EVr3g3HCJZyZGgQf`, Ziel `restaurants/vZOFF4pAyrCh6QNOo2ef` existiert | Historische Lead-Datenform | Codepfade, die nur kanonische Link-Felder lesen, koennen den Restaurant-Link uebersehen | Nach Backup `convertedRestaurantId` in kanonische Linkfelder uebernehmen und Scope klaeren |
| Public Menu fehlt/ist leer bei vielen Restaurants, aber ohne Legacy-Daten | `restaurants/{rid}/public/menu` | 88 Restaurants; 43 davon ohne Public-Menu-Dokument | Viele Leads/Restaurants haben schlicht kein Public Menu | Leere Menus koennen korrekt sein; duerfen nicht blind mit Legacy-Daten gefuellt werden | Produktentscheidung: welche Restaurants brauchen `knownEmpty`, welche brauchen echtes Menu |
| Legacy MenuItems ohne Public Menu | `menuItems` vs `public/menu` | 0 Restaurants | Kein breiter Backfill-Fehler gefunden | Spricht gegen eine generelle Menu-Migration als Ursache | Keine automatische MenuItems->PublicMenu-Migration |
| Public Menu vs Legacy MenuItems weicht ab | `public/menu.items`, `menuItems` | `restaurants/CiLBuUs4R71wqFCyzCFu`: Public 2 Items, Legacy 1 Item | Zwei Menu-Wahrheiten existieren parallel | Editor/Public koennen unterschiedliche Menus zeigen | Manuell vergleichen, Public-Wahrheit bestaetigen, danach gezielt korrigieren |
| Public-Menu-Metadaten fehlen | `menuTruthSource`, `menuTruthState` | 74 Public-Menu-Dokumente; davon 30 mit Items | Aeltere Datenform ohne Truth-Metadaten | Loader kann leer/unknown/seeded schlechter unterscheiden | Migration nach Backup: `menuTruthSource: public-menu`, `menuTruthState: seeded` oder `knownEmpty`, `updatedAt` |
| Public-Offers-Metadaten fehlen | `truthSource`, `truthState` | 67 Offers-Dokumente; davon 1 mit Items (`TtWKnfq131Ra0A0NxuIb`) | Aeltere Datenform ohne Truth-Metadaten | Focus/Shopping/Travel kann schlechter zwischen bekannt leer und nicht geladen unterscheiden | Migration nach Backup/Staging mit klarer Truth-State-Regel |
| Focus/Offers ohne Menu | `public/offers`, `public/menu` | `7IlioiC6zvTB1F1hG2hj`, `GpJOfqAXQVGk2DQUYhkw` | Offers vorhanden, Menu fehlt/leer | Shopping/Focus kann aktiv aussehen, waehrend Menu leer bleibt | Produktlich entscheiden, ob offers-only erlaubt ist; nicht automatisch auffuellen |
| Public Route fehlt fuer geloeschtes Restaurant | `publicRoutes/{slug}` | `restaurants/Oas88BarpewjKe3ALmPj`, slug `casa-mora`, Status `deleted` | Route fuer geloeschten Datensatz fehlt | Direkter Slug routet nicht; vermutlich korrekt bei deleted | Keine Auto-Erstellung; erst klaeren, ob deleted oeffentlich inaktiv routen soll |
| Restaurant ohne Slug | `restaurants.publicSlug`, `landingSlug` | `restaurants/WBCXcgthTFjiSGWR1RTF` | Deleted/alte Datenform | Slug-Resolver kann dieses Restaurant nicht direkt finden | Nur nach Duplicate-Check Slug setzen, falls das Restaurant wieder sichtbar sein soll |
| Restaurants ohne Owner | `restaurants.ownerUid` | `6kV8TXtWRMHSYtgXuySO`, `7QHlfQfM78004L0eawQM`, `Al1tz1uIoHBCLyg6CxDu`, `BsNO0h2HwkarPvZ7jZHr`, `Oas88BarpewjKe3ALmPj`, `VH4YQ4ktjafuTLb2LgaW`, `WBCXcgthTFjiSGWR1RTF` | Lead-/Deleted-/Referenzdaten ohne aktiven Business-Owner | Public kann funktionieren, Owner-Dashboard/Edit/Account aber nicht | Manuelle Ownership-Pruefung vor Backfill |
| OwnerUid zeigt nicht auf User-Dokument | `restaurants.ownerUid`, `users/{uid}` | 35 weitere Restaurants | OwnerUid referenziert keinen existierenden `users/{uid}` im kompletten User-Bestand | Business owner resolution kann fehlschlagen | Auth/User-Export pruefen, dann gezielt reparieren |
| User zeigt auf Restaurant, dessen Owner abweicht | `users.restaurantId`, `restaurants.ownerUid`, `restaurants/{rid}/staff` | `users/otweEmCUDYdNBxXGilQjjp64lU62` -> `Lzm6RpNu3ErSDtGCHxpi`, Restaurant ownerUid `XTn4oQqz3zdNiedL7MafwzDgus32`; Staff enthaelt beide als Owner | Mehrere Owner-/Staff-Beziehungen | Account kann als Business/Owner wirken, obwohl kanonischer Restaurant-Owner ein anderer ist | Staff/Owner-Vertrag klaeren, danach Daten bereinigen |
| Malformed User-Dokument | `users/{docId}`, `uid` | `users/.fieldPaths=uid&updateMask...`, `uidField: NRMUjdDonyUeQtozzAlIF9Qsecq1` | Vermutlich alter fehlerhafter REST-/Update-Call | Admin-/User-Listen koennen Sonderfall sehen | Nach Backup archivieren oder loeschen, nicht blind |
| User ohne `status` | `users.status` | 60 Users | Aeltere User-Datenform | Rollen-/Aktivierungslogik kann je nach Pfad abweichen | Status-Backfill erst nach expliziter Regel |
| PublicRoute-Status bleibt `lead` | `publicRoutes.status` | 139 PublicRoutes | Route-Status wird offenbar nicht als aktive Business-Wahrheit gepflegt | Resolver routet `lead`, Admin-/Analyse-Status kann irrefuehrend sein | Status-Vertrag definieren, dann Migration; keine Routing-Aenderung ohne Freigabe |
| Alte UserPosts ohne Restaurant-Link | `users/{uid}/posts` | 63 Posts in 3 User-Post-Collections | Alter/usernaher Post-Pfad ohne `restaurantId`/`rid` | Nicht fuer Restaurant-Profil-Posts geeignet; kann bei Fallbacks verloren gehen | Nicht als Profil-Post-Wahrheit nutzen; nur nach Ownership-Klaerung migrieren |
| Leere/kaputte Feed-Projektionen | `socialFeed` | 18 Feed-Dokumente ohne erkannte Medien-/Textfelder | Alte oder unvollstaendige Feed-Projektion | Feed kann einzelne Docs filtern oder leer rendern | Nach Review archivieren oder Post-Daten reparieren |

## Daten tragende Restaurant-Flaechen

Diese Tabelle listet alle Restaurants, bei denen im Complete-Run mindestens
eine relevante Flaeche Daten trug. Restaurants ohne Menu/Offers/Posts/Stories/
Staff sind im JSON-Report ebenfalls enthalten, aber hier nicht aufgefuehrt.

| Restaurant | public/menu | menuItems | offers | socialPosts | stories | staff | menuTruth | offersTruth |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `0PkyaN3ua3kwBBU2OVs6` | 14 | 14 | 3 | 4 | 0 | 0 | `seeded` | `seeded` |
| `10Z8UNFsx4ha5wnZIloy` | 2 | 0 | 0 | 3 | 10 | 1 | `seeded` | `-` |
| `3brvJQPCPl2NbhqTuD3j` | 2 | 0 | 0 | 1 | 3 | 0 | `-` | `-` |
| `4EwWoWk3A0L1Ghu0lZlT` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `4SzTYvmTFz3SFYrbkyWv` | 10 | 10 | 2 | 4 | 0 | 0 | `seeded` | `seeded` |
| `4wLLOs01cBvBmmcUylbW` | 6 | 6 | 2 | 4 | 0 | 0 | `seeded` | `seeded` |
| `7IlioiC6zvTB1F1hG2hj` | 0 | 0 | 1 | 0 | 0 | 0 | `-` | `seeded` |
| `9oBS9F8rFcSMZMs6Bq2v` | 36 | 36 | 2 | 2 | 0 | 0 | `seeded` | `seeded` |
| `ACXqHBME4mUpA2QZpN6N` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `Al1tz1uIoHBCLyg6CxDu` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `BiQuzsIkOqTdK9t5AFj8` | 2 | 0 | 0 | 0 | 2 | 1 | `seeded` | `knownEmpty` |
| `CiLBuUs4R71wqFCyzCFu` | 2 | 1 | 0 | 0 | 0 | 0 | `-` | `-` |
| `DgL13AFg8pQrCVAjIpHt` | 2 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `EZm9544ygYf9bYNzyjgR` | 13 | 13 | 0 | 1 | 0 | 0 | `seeded` | `knownEmpty` |
| `GpJOfqAXQVGk2DQUYhkw` | 0 | 0 | 1 | 4 | 0 | 0 | `-` | `seeded` |
| `I6Z0sKs2gadyl1srPCaS` | 4 | 4 | 0 | 4 | 0 | 0 | `seeded` | `-` |
| `JEQl4eQELXzjhGRfLmDS` | 2 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `Lzm6RpNu3ErSDtGCHxpi` | 39 | 39 | 2 | 1 | 3 | 4 | `seeded` | `seeded` |
| `Ni9iUR01392APYuHThlj` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `Oas88BarpewjKe3ALmPj` | 11 | 11 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `P2POV7ohbh8q5ScEj7Zd` | 129 | 129 | 0 | 0 | 0 | 1 | `seeded` | `-` |
| `PxibQIWhOKSX7erV6Uo3` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `RUb9gIPSGoYM2qT3xXxJ` | 14 | 14 | 2 | 4 | 0 | 1 | `seeded` | `seeded` |
| `SXTmnWIqSrMKaXu1hxaI` | 8 | 8 | 3 | 4 | 0 | 0 | `seeded` | `seeded` |
| `SgVkc7hI7UjaQq8AzDBI` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `TS8dlIq6EHWALz0GbU0h` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `TtWKnfq131Ra0A0NxuIb` | 3 | 3 | 1 | 0 | 3 | 0 | `-` | `-` |
| `UaBXJhHL2Ahe9yqWyixd` | 0 | 0 | 0 | 0 | 0 | 1 | `-` | `-` |
| `V6Lh2Lw5e4oxTtQRvlBi` | 10 | 10 | 2 | 4 | 0 | 0 | `seeded` | `seeded` |
| `YZq9MI9qZBr2u58KEdix` | 2 | 0 | 0 | 2 | 4 | 0 | `-` | `-` |
| `aLsCXUdJaQBAUJHHEpwC` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `bQ11M4IsUEgxqp4vIwJ2` | 3 | 3 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `bSF4KgFbrsxx9UhUcwdC` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `bl43MsBb2tIY6aR1IMFj` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `cKw1nQZARQauvWerKUni` | 10 | 10 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `dYdIs8hwVwOl1d9RzYEz` | 3 | 3 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `edmdx97bLpUISAJ2tSTH` | 7 | 7 | 0 | 2 | 0 | 0 | `-` | `-` |
| `f0QLPXHURzRL93Ss2cUn` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `g76oMImGKI2bE5onBBbL` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `gl0BD67IbGIuUxrxG6Eo` | 2 | 2 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `k9VdNnK0zvQ2Fb0AXWHM` | 2 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `kbWu03Rh3nkiTM7HqoA0` | 30 | 30 | 0 | 1 | 5 | 1 | `seeded` | `knownEmpty` |
| `nhDFTJ1Zde15uCT1qyan` | 3 | 3 | 0 | 0 | 0 | 0 | `seeded` | `-` |
| `o9k9PhrsKwFFdpJr5Hcq` | 2 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `pfm4f0C5cl2kfM8WYnKf` | 2 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `prince-coffe-house-001` | 4 | 4 | 1 | 5 | 0 | 1 | `seeded` | `seeded` |
| `q0gYewIDsTinq9lJGK5e` | 1 | 0 | 0 | 0 | 2 | 0 | `-` | `-` |
| `qNofAvx3SpDTCliAr9LX` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `qrQeOiqtIyJxvoPZ4h01` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `rShJdtQCZePfXMJZ88O0` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `shpija-e-vjetr` | 19 | 19 | 3 | 4 | 2 | 1 | `seeded` | `seeded` |
| `tR2rylGoHfg5zCEyY7oB` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `tlYE8iX1iUuESoO1le8G` | 3 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `vEZd3Lq3vtWNX00zyW9N` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |
| `vZOFF4pAyrCh6QNOo2ef` | 12 | 12 | 2 | 4 | 3 | 1 | `seeded` | `seeded` |
| `zdocVPvslVjsFL8Z4csz` | 1 | 0 | 0 | 0 | 0 | 0 | `-` | `-` |

## Konkrete Codeprobleme beim Laden

| Prioritaet | Bereich | Problem | Effekt | Status / Fix |
| --- | --- | --- | --- | --- |
| P0 | Public Menu In-flight | Ein sichtbarer Public-Menu-Load konnte ein bereits laufendes `unknown`-/Prefetch-Ergebnis als `error` uebernehmen | Kurz `Menu konnte nicht geladen werden`, danach erscheinen Daten | Gefixt in `session-data-runtime-controller.js`; Test ergaenzt |
| P1 | Public Menu Error Branch | Der sichtbare Catch-Pfad kann weiterhin einen echten Fehler setzen, obwohl ein spaeter Retry oder kanonischer ID-Load noch laufen kann | Fehlertext kann zu frueh final wirken | Fehler erst final setzen, wenn kanonische Restaurant-ID stabil ist und kein Retry/In-flight/valid cache mehr offen ist |
| P1 | Alias vs kanonische Restaurant-ID | Profil-Orchestrator laedt requested ID, Route-ID und kanonische ID; alte Alias-Zustaende muessen konsequent nicht gewinnen | Kurz falsches leer/unknown/error auf Profil/Menu | Request-Token oder canonical-wins-Regel fuer Error- und Empty-State verschaerfen |
| P1 | Profil-Posts | Profil liest `restaurants/{rid}/socialPosts`, Feed liest `socialFeed`; alte `users/*/posts` sind nicht kompatibel | Feed kann stabil wirken, Profil-Beitraege fehlen oder kommen spaeter | Profil nur ueber `restaurants/*/socialPosts` stabilisieren; UserPosts nicht als Fallback nutzen |
| P1 | Lead-Link-Feldnamen | Aktueller Code liest primaer `restaurantId`/`landingRestaurantId`, alter Lead nutzt `convertedRestaurantId` | Converted Lead kann in CRM/Auth/Profil-Aufloesung fehlen | Datenmigration nach Backup oder Resolver bewusst um legacy Feld erweitern |
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
- `functions/scripts/audit-mnyra-complete-data-flow-readonly.cjs`
  - Neuer reproduzierbarer Complete-Read-only-Inventarlauf fuer alle relevanten
    Datenformen.

Verifiziert:

- `node --test tests\session-data-menu-focus-no-hang.test.mjs`
- Complete Read-only Script gegen Production:
  `node functions\scripts\audit-mnyra-complete-data-flow-readonly.cjs --out C:\mnyra-secrets\mnyra-systemfix2027-complete-data-flow-audit-20260629.json`

Nicht gemacht:

- keine UI-/Design-Aenderung
- keine Datenmigration
- keine Firestore-Writes
- keine Deletes
- kein Rules-/Functions-Deploy
- keine Smoke-/Playwright-Laeufe

## Fixes erst nach Backup / Staging / Migration

P0/P1 vor Production-Mutation klaeren:

- `leads/oEE6EVr3g3HCJZyZGgQf`: `convertedRestaurantId` nach klarer Regel in
  `restaurantId`/`landingRestaurantId` uebernehmen und Scope-Felder klaeren.
- Public-Menu-Truth-Metadaten fuer 74 Dokumente backfillen.
- Public-Offers-Truth-Metadaten fuer 67 Dokumente backfillen.
- `restaurants/CiLBuUs4R71wqFCyzCFu` manuell vergleichen und Public-vs-Legacy-
  Menu-Wahrheit festlegen.
- Restaurants ohne `ownerUid` pruefen und nur mit bestaetigter Ownership
  korrigieren.
- 35 weitere OwnerUid/User-Relationen pruefen, nicht automatisch reparieren.
- `users/otweEmCUDYdNBxXGilQjjp64lU62` klaeren: Staff, alter Owner oder
  falscher Business-Link.
- Malformed `users/.fieldPaths=...`-Dokument nach Backup gezielt behandeln.
- User-Status-Migration fuer 60 Users erst nach klarer Status-Regel.
- `publicRoutes.status`-Vertrag definieren, bevor `lead`/`active`/`inactive`
  migriert wird.
- Fehlende Public-Menu-Dokumente nicht blind erzeugen; zuerst entscheiden,
  ob `knownEmpty` fuer alle menu-losen Leads/Restaurants gewollt ist.
- 63 alte `users/*/posts` nicht blind in Restaurant-Profil-Posts migrieren;
  erst Ownership und Ziel-Restaurant klaeren.

## Priorisierte Fixliste

P0:

- Falschen Public-Menu-In-flight-Error entfernen. Erledigt.
- Bei erneutem Auftreten konkrete Route/Restaurant-ID loggen: requested ID,
  route restaurantId, canonical restaurantId, cache hit, public/menu result,
  final visible state.

P1:

- Canonical-wins-Regel fuer Public-Menu-Error/Empty-State haerter machen.
- Lead-Conversion-Feldvertrag normalisieren:
  `convertedRestaurantId` darf nicht die einzige Restaurant-Verknuepfung bleiben.
- Profil-Posts-Vertrag gegen Feed/UserPosts-Vertrag pruefen; Profil darf nicht
  von `users/*/posts` abhaengen.
- Public-Menu-/Offers-Truth-Metadaten als Staging-Migration vorbereiten.
- Owner-/Business-Account-Relationen vor Aktivierungs-/Account-Fixes auditieren.

P2:

- Cache-Invalidierung mit `updatedAt`/Truth-State vereinheitlichen.
- `publicRoutes`-Snapshot-Felder als reine Hints dokumentieren, nicht als finale
  Menu-Wahrheit.
- Alte `menuItems`-Daten nach bestaetigter Public-Wahrheit archivieren oder als
  Editor-Only-Vertrag festschreiben.
- Feed-Projektionen ohne erkennbare Medien-/Textfelder nach Review bereinigen.

## Manuelle Testliste

Ohne Production-Schreibaktionen:

1. Mehrere Public-Slugs mit unterschiedlichen Datenformen hart laden:
   ein Restaurant mit `menuTruth=seeded`, eins mit Menu ohne Truth-Metadaten,
   eins mit Offers ohne Menu.
2. Profil und `/menu` direkt laden, dann zwischen Profil und Menu wechseln.
3. Beobachten, ob kurz `Menu konnte nicht geladen werden` erscheint und ob
   danach Daten erscheinen.
4. Beitraege-Tab oeffnen und mit Feed vergleichen.
5. Bei betroffenen IDs in der Browser-Console nur lesen, keine QR-/Order-/
   Checkout-Schreibflows ausfuehren.
