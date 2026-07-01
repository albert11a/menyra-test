# Mnyra Firebase Emulator Guide

Status: CURRENT
Last updated: 2026-07-01

## Local Project

Use only:

- Project ID: `mnyra-local`
- Firestore emulator: `127.0.0.1:8080`
- Auth emulator: `127.0.0.1:9099`
- Functions emulator: `127.0.0.1:5001`
- Emulator UI: `127.0.0.1:4000`

Do not use production Firebase data for tests or seeds.

## Commands

- Start emulators: `npm run emulators:start`
- Seed local Firestore: `npm run emulators:seed`
- Export emulator data: `npm run emulators:export`
- Rules tests: `npm run test:rules`
- Functions tests: `npm run test:functions`

## Safe Startup

1. Run `npm install`.
2. Run `npm run emulators:start`.
3. In another terminal, run `npm run emulators:seed`.
4. Run rules/functions tests only against the emulator.

## Guardrails

- `seed/scripts/seed-firestore.mjs` refuses non-local project IDs unless
  explicitly overridden.
- `.firebaserc` production default is not used by seed scripts.
- Production deploy commands are out of scope for this branch.

## Future Rules Tests

Add tests for:

- Guest cannot manipulate orders outside allowed guest contract.
- User cannot directly manipulate social counters.
- Waiter sees only authorized restaurant orders.
- Owner edits only owned business.
- CEO/Heart approves Ads.
- Public reads only public profile/menu/posts.
- Private user data remains protected.
