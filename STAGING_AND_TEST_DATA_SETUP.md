Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Staging and Test Data Setup

## Aktueller Zustand

- `.firebaserc` zeigt nur `menyra-c0e68`.
- `firebase.json` enthaelt Functions und Firestore, aber keine Emulator-Sektion.
- Keine sicheren Staging-Credentials im Repo.
- Keine Production-Daten wurden veraendert.

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
- `firebase.json` Emulator-Sektion.
- `.env.staging.example` ohne Secrets.
- Runner Config `tests/mnyra-heart-runner/config/staging-guest-config.json`.
- Rules Test Script, z.B. `npm run test:rules`.

## Was in diesem Schritt real getestet wurde

- Lokal mit Static Server: Guest QR/Menu read-only, keine Order-Mutation.
- Mit Mocks/Unit: Runtime Controller Tests.
- Nicht getestet: echte Staging-Auth, echte Staging-Orders, echte Uploads, echte Waiter-Statusupdates.

