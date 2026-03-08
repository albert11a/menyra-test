# MENYRA Social - Current Overview (2026-03-08)

This repository is now social-first and keeps only the Social web app.

## Active App
- Social (`apps/menyra-social/`)
  - feed, search/discover, profile, chat, notifications, shop/cart, CRM tabs
  - login/register/auth bootstrap
  - PWA/service worker and push open-target handling

## Routing and Compatibility
- Primary entry: `/` -> `/apps/menyra-social/index.html`
- Legacy role paths (`/ceo`, `/owner`, `/staff`, `/waiter`, `/kitchen`) are mapped to social tabs via `vercel.json`.
- Legacy removed app paths (`/apps/menyra-ceo/*`, `/apps/menyra-owner/*`, `/apps/menyra-staff/*`, `/apps/menyra-restaurants/*`) are compatibility-routed to Social.

## Data Model (Social-Relevant Core)
- Restaurants/business entities: `restaurants/{rid}`
- Social feed index: `socialFeed/{postId}`
- Restaurant social posts: `restaurants/{rid}/socialPosts/{postId}`
- User social data under `users/{uid}/...` (notifications, following, devices, etc.)

## Tech Notes
- Firebase (Auth, Firestore, Storage) via browser ES modules (`shared/firebase-config.js`)
- Firestore initialized with long-polling auto-detect for unstable webchannel networks
- Shared UI/assets in `shared/` and `apps/menyra-social/assets`

## Local Start
1. Start a static server in repo root.
2. Open `/index.html`.

## Rollback Safety
- Safe restore tag: `social-safepoint-2026-03-08-pre-cleanup`
