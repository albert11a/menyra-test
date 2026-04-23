Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 10: Mainline Public Guest Read-Path Stability Fix

## Schrittziel

Im oeffentlichen Guest-Profilpfad (`/:slug`, `/:slug/posts`, `/:slug/menu`) unnoetige Realtime-Dauerlast reduzieren:
wo nicht fachlich noetig, statt `onSnapshot` auf stabilen einmaligen Read gehen.

## Realtime-Inventar im Public-Gast-Pfad

1. `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
   - Stelle: `attachProfileViewListener(...)`
   - Bisher: `onSnapshot` auf `restaurants/{id}` (bzw. `users/{uid}`) nach `showPublicProfile(...)`
   - Bewertung fuer Public-Gast-Pfad: kein zwingender Dauerlistener fuer den Start-/Refresh-Pfad noetig

2. `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
   - Stelle: `startMenuMetaListener(...)`
   - Status: im Guest-`source=public` bereits deaktiviert (kein Realtime-Listener)
   - In diesem Schritt unveraendert

3. Posts-/Menu-/Focus-Ensure-Pfade
   - `profile-business-menu-runtime-cluster.js`, `profile-menu-focus-render-controller.js`,
     `menu-public-runtime-controller.js`, `focus-runtime-controller.js`
   - Ergebnis: im betrachteten Public-Gast-Pfad kein eigener `onSnapshot`-Start fuer den First-Content-Pfad

## Was umgesetzt wurde

`apps/menyra-social/core/profile/public-profile-runtime-controller.js`:

- Public-Gast-Kontext-Erkennung fuer den Web-Direct-Business-Pfad eingefuehrt (`isGuestPublicBusinessRouteContext`).
- Listener-Target-Aufloesung zentralisiert (`resolveProfileViewListenerTarget`).
- Profil-Doc-Patch in sichtbaren State zentralisiert (`applyProfileViewDocToVisibleState`).
- Neuer einmaliger Profil-Read pro Kontext (`refreshProfileViewOnce`) mit dedupliziertem In-Flight/Completed-Guard.
- `attachProfileViewListener(...)` umgestellt:
  - Public-Gast-Pfad: kein Realtime-Listener, stattdessen einmaliger `getDoc`-Read.
  - andere Kontexte: bestehender `onSnapshot`-Pfad bleibt erhalten.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step10-mainline-public-guest-read-path-stability-fix.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Root-/Routing-Umbau.
- `/login` unveraendert.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Keine Surface-/Tab-/Klicklogik-Aenderung.
- Keine QR-URL-/QR-Vertragsaenderung.
- Kein Playwright, keine Smoke-Tests.

## Manuelle Testliste

1. Hard Reload auf `/:slug`: Header erscheint, Content stabil nachgeladen, kein dauerhafter Profil-Listenstrom.
2. Hard Reload auf `/:slug/posts`: Beitraege laden stabil; keine wiederkehrende Profil-Realtime-Subscription.
3. Hard Reload auf `/:slug/menu`: Menu/Fokus kommen verlaesslich; kein Profil-Listener-Stapeln.
4. 30-60 Sekunden auf `/:slug/menu` bleiben und Network beobachten: kein neuer Listen-/Request-Sturm.
5. Zwischen `/:slug/posts` und `/:slug/menu` wechseln: kein kumulierendes Listener-Verhalten.
6. Echten QR-Link oeffnen: bestehendes Profil-/Menu-QR-Verhalten bleibt kompatibel.
7. Nach Refresh pruefen, dass Produkte im Menu zuverlaessig erscheinen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
