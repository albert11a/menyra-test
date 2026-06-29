Status: CURRENT
Branch: systemfix2027
Stand: 2026-06-29

# Staging and Test Data Setup

## Aktueller Zustand

- `.firebaserc` zeigt nur `menyra-c0e68`.
- `firebase.json` enthaelt jetzt eine Emulator-Sektion fuer Functions, Firestore, Auth und Emulator UI.
- Java 26 und Firebase CLI 15.1.0 sind lokal vorhanden.
- Firestore/Auth Emulator starten lokal per
  `firebase emulators:exec --only 'firestore,auth' 'node -e "console.log(''emulator-smoke-ok'')"'`
  erfolgreich.
- Im verbundenen Firebase Account ist `testmnyramatrix` als moeglicher
  Staging-Kandidat sichtbar, aber dort ist aktuell keine Web-App registriert.
- Keine sicheren Staging-Credentials im Repo.
- Keine Production-Daten wurden geschrieben, geloescht oder manipuliert.
- Order-Callable `createRestaurantOrder` ist auf Production deployed. Firestore-Rules sind nach erfolgreichem Vercel-Deploy fuer `main` deployed. Es wurde nur CORS-Preflight getestet, kein produktiver Order-Schreibtest.

## Bewertung

Echte End-to-End Launch-Readiness ist ohne Staging/Emulator nicht belastbar pruefbar. Aktuell koennen Order-, Upload-, Role- und Account-Wechsel-Flows nur statisch oder read-only lokal bewertet werden.

## Benoetigte Environments

1. Firebase Staging Project:
   - Firestore
   - Auth
   - Storage/Media oder Mock Media
   - Functions
   - gleiche Rules wie Production Candidate

2. Lokaler Emulator:
   - Firestore Emulator
   - Auth Emulator
   - Functions Emulator fuer Order Callable
   - optional Storage Emulator oder Media Mock

Lokale Ports:

- Functions: `0.0.0.0:5001`
- Firestore: `0.0.0.0:8080`
- Auth: `0.0.0.0:9099`
- Emulator UI: `127.0.0.1:4000`

Der Social-Client verbindet Firebase Functions bei lokalen Hosts (`localhost`, `127.0.0.1`, `192.168.*`, `10.*`, `172.16-31.*`) automatisch mit dem Functions Emulator auf demselben Host und Port `5001`.

## Seed Personas

- Normaler User A mit Profilbild.
- Normaler User B ohne Profilbild oder anderem Profilbild.
- Business Account mit Restaurant, Logo, Cover, Menu, Posts, Bildern.
- Staff Account mit Business Access.
- Waiter Account mit Waiter Access.
- Kitchen Account, falls produktseitig als eigene Rolle definiert wird.
- Owner Account.
- CEO/Admin Account.
- Guest ohne Login.

## Seed Restaurant

- Restaurant `staging-restaurant-qr`.
- Public slug `staging-qr-menu`.
- Mindestens 20 Produkte.
- Mindestens 4 Produkte mit Bildern.
- Mindestens 2 Produkte ohne Bilder fuer Placeholder-Test.
- Preise in verschiedenen Formaten.
- QR/Table-Kontexte: Tisch 1, Tisch 2, Tisch 99.
- Orders:
  - Neu
  - In Bearbeitung
  - Fertig
  - Abgeschlossen/Storniert, falls Statusmodell vorhanden.

## Testdaten fuer Social

- User A Post.
- User B Post.
- Business Post.
- Likes von User A/B.
- Kommentare von User A/B.
- Follow/Unfollow Beziehung.

## Required Config

Empfohlen:

- `.firebaserc` Alias `staging`.
- Firebase Web-App fuer Staging/Testprojekt inklusive nicht-geheimer
  Web-App-Konfiguration.
- `firebase.json` Emulator-Sektion.
- `.env.staging.example` ohne Secrets.
- Runner Config `tests/mnyra-heart-runner/config/staging-guest-config.json`.
- Rules Test Script, z.B. `npm run test:rules`.
- Staging Deploy Gate fuer `createRestaurantOrder` und `firestore.rules`.
- Lokal: `firebase emulators:start --only functions,firestore,auth` plus Seed-Daten.

## Was in diesem Schritt real getestet wurde

- Lokal mit Static Server: Guest QR/Menu read-only, keine Order-Mutation.
- Mit Mocks/Unit: Runtime Controller Tests.
- Mit Unit-Test: Order-Checkout-Intent, serverseitige Preisberechnung, versteckte Items, spoofed Buyer UID, Rule-Create-Sperre statisch.
- Nicht getestet: echter lokaler Emulatorlauf mit Seed-Daten, echte Staging-Auth, echte Staging-Orders, echte Uploads, echte Waiter-Statusupdates.

## Naechster Order-Staging-Test

1. Staging/Emulator oder klar markierte Testdaten vorbereiten.
2. Seed-Restaurant mit `public/menu` und optional `menuItems` anlegen.
3. QR-Link mit `src=qr&r=<restaurantId>&table=1` oeffnen.
4. Produkt in Warenkorb legen und Checkout senden.
5. Pruefen:
   - `restaurants/{restaurantId}/orders/{orderId}` existiert.
   - `total` und `totalCents` entsprechen Server-Menu-Preis.
   - keine Client-Manipulation von Preis/Status moeglich.
   - Guest `orderLookup` wurde erzeugt.
   - Waiter/Owner sieht Order.
   - direkter Firestore-Create aus Client/Rules-Test wird abgelehnt.
