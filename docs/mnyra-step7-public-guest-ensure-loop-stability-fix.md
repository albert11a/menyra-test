Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 7: Public Guest Ensure-/Fetch-Loop Stabilisierung

## Schrittziel

P0-Fix fuer den oeffentlichen Guest-Profilpfad (`/:slug`, `/:slug/posts`, `/:slug/menu`):
denselben Public-Kontext nicht mehr fortlaufend in neue Ensure-/Fetch-Ketten laufen lassen und den Surface-Status sauber settle lassen.

## Echte Ursache

1. Reentry aus dem Renderpfad:
   Im Public-Surface werden `ensurePostsDataForProfile`, `ensureMenuDataForProfile` und `ensureFocusDataForProfile` waehrend `loading/pending` wiederholt aufgerufen.

2. Fehlende stabile Drossel fuer Menu/Fokus-Ensure:
   Im Profile-Business-Cluster gab es fuer Menu/Fokus keine eigene In-Flight-Sperre pro Public-Kontext.
   Dadurch konnten bei erneutem Render waehrend laufender Loads neue Ensure-Ketten gestartet werden.

3. Posts-Surface konnte trotz bereits geladenem Ergebnis auf `loading` bleiben:
   In der Surface-Status-Aufloesung dominierte `routePayload.posts=unknown` den Zustand, auch wenn `postsLoaded=true` bereits gesetzt war.
   Das hielt den Posts-Surface in einem Reentry-faehigen Loading-Zustand.

## Was geaendert wurde

1. `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
   - Canonical-Restaurant-Aufloesung um einen stabilen Cache erweitert (`canonicalRestaurantIdCache`), damit derselbe Kontext nicht wiederholt neu aufgeloest wird.
   - In-Flight-Guards pro Ziel-Restaurant fuer `ensureMenuDataForProfile` und `ensureFocusDataForProfile` eingefuehrt.
   - Menu-/Focus-Loader in diesen Ensures explizit awaited, damit die Guard bis zum Ende des laufenden Loads aktiv bleibt.

2. `apps/menyra-social/core/profile/public-profile-surface-controller.js`
   - `resolvePostsStatus` korrigiert:
     `routePayload.posts=unknown` erzwingt nur dann `loading`, wenn der Profilkontext noch nicht als `postsLoaded=true` markiert ist.
   - Damit kann der Public-Posts-Surface nach realem Ergebnis (`empty/ready/error`) sauber settle.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Root-/Routing-Umbau.
- Kein Eingriff in `/login`.
- Keine Firebase-Rules-/Functions-Aenderung.
- Keine breiten Refactors ausserhalb des Public-Ensure-/Surface-Kerns.
- Keine Smoke-/Playwright-Tests.
- Keine QR-Vertragsaenderung.

## Manuelle Testliste

1. `/:slug/menu` oeffnen und 30-60 Sekunden Network beobachten: keine fortlaufend anwachsende Ensure-/Fetch-Kette fuer denselben Kontext.
2. Zwischen Profil / Beitraege / Menu wechseln: keine Reentry-Wellen im selben offenen Profilkontext.
3. Hard Reload auf `/:slug`: Header + Surface sollen in einen stabilen Zustand kommen, ohne dauerhafte Re-Requests.
4. Hard Reload auf `/:slug/posts`: kein dauerhaftes Haengen auf `loading` bei bereits abgeschlossenem Posts-Ergebnis.
5. Hard Reload auf `/:slug/menu`: Menu/Fokus sollen nicht fortlaufend neu angeschoben werden.
6. Echten QR-Link oeffnen: bestehendes QR-Menu-Verhalten muss unveraendert kompatibel bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
