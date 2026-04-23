Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 10: Public Canonical Restaurant-ID Hint Fix

## Schrittziel

Kleinster sicherer Fix fuer den spaeten First-Load von `/:slug/posts` und `/:slug/menu`:
die bereits vorhandene kanonische `restaurantId` nur als Hint in den Public-Ensure-Pfad durchreichen und dort als First-Choice nutzen.

## Echte Ursache

1. Der Public-Web-Direct-Pfad arbeitete frueh weiter mit dem Route-Slug als `profile.restaurantId`, obwohl der Bootstrap die kanonische `restaurantId` bereits kannte.

2. Dieser kanonische Wert ging im Seed-/Visible-Profile-Pfad nicht stabil genug mit.
   Dadurch fielen Posts/Menu/Fokus spaeter wieder auf Resolver ueber Slug/Doc/Handle zurueck.

3. Besonders `ensurePostsDataForProfile()` lief trotz moeglichem kanonischen Kontext weiter durch die alte Kandidatenkette und konnte damit erneut Profil-Resolve ausloesen.

## Was geaendert wurde

1. `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
   - Web-Direct-Seed kann den vorhandenen Route-Bootstrap jetzt auch ueber den Public-Slug matchen, nicht nur ueber exakte `restaurantId`.
   - Die im Bootstrap vorhandene kanonische `restaurantId` wird als separates `canonicalRestaurantId`-Hint-Feld in das seeded Public-Profil geschrieben.

2. `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
   - Wenn der Public-Bootstrap erst kurz nach dem ersten Seed eintrifft, kann der Web-Direct-Route-Payload jetzt ebenfalls ueber den Public-Slug dem sichtbaren Profil zugeordnet werden.
   - Der spaeter eintreffende Bootstrap schreibt dann ebenfalls nur den kanonischen ID-Hint ins sichtbare Profil.

3. `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
   - `showPublicProfile(...)` behaelt den bereits bekannten `canonicalRestaurantId`-Hint fuer dasselbe sichtbare Profil bei, statt ihn bei spaeteren Loading-/Interim-Updates wieder zu verlieren.

4. `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
   - `resolveProfileRestaurantId()` schreibt beim Wechsel von Slug -> kanonischer ID den Hint mit in das sichtbare Profil.
   - `ensurePostsDataForProfile()` verwendet einen bereits vorhandenen `canonicalRestaurantId`-Hint jetzt als exklusiven First-Choice.
   - Nur wenn dieser Hint fehlt, bleibt der bisherige stabile Fallback ueber Slug/Handle/Resolver aktiv.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

## Warum das den spaeten Load reduziert

1. Auf `/:slug/posts` und `/:slug/menu` muss der sichtbare Public-Ensure-Pfad nicht mehr zuerst erneut denselben Slug-/Doc-Kontext erraten, wenn die kanonische ID schon bekannt ist.

2. Der Posts-Ensure springt bei vorhandenem Hint direkt auf die kanonische Restaurant-Collection und ueberspringt damit unnoetige zweite Aufloesungen.

3. Menu und Fokus behalten ihre bestehende Ensure-Logik, bekommen die kanonische ID aber frueher als Resolver-Hint und koennen dadurch frueher auf den richtigen Zielkontext gehen.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Aenderung an Surface-/Tab-Umschaltung.
- Keine neue Klicklogik fuer Menu oder Beitraege.
- Keine Aenderung daran, wann etwas als `already open` gilt.
- Kein Root-Umbau von `/`.
- Kein Eingriff in `/login`.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Keine Listener-/Realtime-Umbauten.
- Keine QR-/Menue-URL-Vertragsaenderung.
- Keine Smoke-Tests, kein Playwright.

## Manuelle Testliste

1. Hard Reload auf `/:slug`:
   Header wie bisher frueh sichtbar, Posts sollen weniger spaet nachziehen.
2. Hard Reload auf `/:slug/posts`:
   Posts sollen frueher aufloesen, ohne spaete zweite Slug-/Doc-Schleife.
3. Hard Reload auf `/:slug/menu`:
   Menu/Fokus sollen frueher am richtigen Restaurant-Kontext ankommen.
4. Im Profil auf Menu klicken:
   bestehendes Menu-Verhalten und sichtbare Tab-Reaktion muessen unveraendert bleiben.
5. Im Profil auf Beitraege klicken:
   bestehendes Posts-Verhalten muss unveraendert bleiben.
6. Echten QR-Link oeffnen:
   QR muss weiter auf dieselbe Profilseite fuehren und Menu sofort oeffnen.
7. Pruefen, dass der Menu-Tab weiter klickbar bleibt.
8. Pruefen, dass kein Request-/Listener-Sturm wieder auftaucht.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
