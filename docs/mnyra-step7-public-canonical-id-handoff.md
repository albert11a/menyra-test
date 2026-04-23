Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 7: Public canonical restaurantId Handoff fuer Posts/Menu-Ensure

## Schrittziel

Kleinster sicherer Kern im oeffentlichen Open-/Direct-Entry-Flow:
eine bereits frueh verfuegbare canonical `restaurantId` konsequent in den Posts-/Menu-Ensure-Pfad durchreichen, damit beim First Load keine unnoetige zweite Profil-/Restaurant-Aufloesung gestartet wird.

## Was geaendert wurde

1. Open-Flow (`profile-open-flow-utils.js`)
   - canonical-ID-Hint aus Route-Snapshot frueh erfasst.
   - Den Hint in die fruehen Public-Profile-Objekte geschrieben (`canonicalRestaurantId`).
   - Fruehe `ensureMenuData`-/`ensureFocusData`-Aufrufe auf Menu-TopTab bekommen jetzt direkt `{ restaurantId, canonicalRestaurantId }`.
   - Nach der fruehen Profilauflosung (`fetchBusinessProfileDoc`) wird die canonical ID in den laufenden Profile-State uebernommen und weitergereicht.

2. Direct-Entry-Seed (`public-profile-direct-entry-controller.js`)
   - Bereits im initialen Web-Direct-Seed wird `canonicalRestaurantId` aus dem vorhandenen Route-Snapshot mitgefuehrt (wenn vorhanden).

3. Ensure-Runtime (`profile-business-menu-runtime-cluster.js`)
   - `resolveProfileRestaurantId` nutzt zuerst `profile.canonicalRestaurantId` als First-Choice.
   - Nur ohne canonical Hint faellt der Pfad auf die bisherige Profilauflosung zurueck.
   - Im Posts-Ensure wird bei vorhandenem canonical Hint direkt der canonical Kandidat priorisiert und mit `skipProfileResolve` geladen.
   - Beim Refresh der sichtbaren Public-Profile-View wird `canonicalRestaurantId` konsistent mitgefuehrt.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Root-/Routing-Umbau.
- Kein Eingriff in `/login`.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Keine Listener-/Realtime-Strategie-Umbauten.
- Keine Smoke-/Playwright-Tests.
- Keine Scope-Erweiterung ausserhalb des kleinen Open-Flow-/Ensure-Kerns.

## Manuelle Testliste

1. Hard Reload auf `/:slug/posts`: Header + Posts sollten frueher gemeinsam stabil werden; keine spaete zweite Nachzieh-Welle fuer Posts.
2. Hard Reload auf `/:slug/menu`: Menu/Fokus sollten frueher in den richtigen Zustand kommen; weniger spaetes Nachziehen hinter dem Header.
3. Direktstart auf `/:slug` und Wechsel zu `posts`/`menu`: keine unnoetige zweite Profilauflosung sichtbar (insbesondere beim ersten Wechsel).
4. Echten QR-Link auf `/:slug/menu` testen: bestehendes QR-Verhalten und Menu-Open-Invariante muessen unveraendert bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
