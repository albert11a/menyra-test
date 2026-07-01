# Mnyra Seed Data Guide

Status: CURRENT
Last updated: 2026-07-01

## Files

- Data: `seed/data/mnyra-local-seed.json`
- Script: `seed/scripts/seed-firestore.mjs`

## Command

Start Firestore emulator first, then run:

```bash
npm run emulators:seed
```

The script defaults to:

- `MNYRA_FIREBASE_PROJECT_ID=mnyra-local`
- `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`

## Seed Coverage

The local seed includes:

- Restaurant `pidhi-madh`
- Public route `pidhimadh`
- Public profile, menu metadata and focus offers
- 24 menu items
- Social posts, comments and likes examples
- QR tables
- Orders
- Waiter user
- Owner user
- CEO/Heart user
- Shop business
- Hotel business
- Travel offer
- Ad approval examples

All seed data is synthetic and local-only.

## Extension Rules

- Never paste real customer data into seed files.
- Keep IDs deterministic.
- Add one flow at a time.
- Update Rules/E2E TODOs when adding new seed surfaces.
