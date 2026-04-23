Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 12: Public Profile Core Implementation

## Schrittziel

Den oeffentlichen Profil-Kernbereich fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
inklusive QR -> dieselbe Profilwelt mit offenem Menu konsistent auf
`canonicalRestaurantId` als Runtime-Wahrheit festziehen.

## Umgesetzter Kern

### A. Canonical-Handoff ohne falsche Frueh-Festlegung

- `canonicalRestaurantId` wird nicht mehr implizit aus einem unaufgeloesten Route-Lookup (`slug`/Handle) erzwungen.
- Der Public-State behaelt bei ungeklaerter Identitaet weiter `restaurantId` als Lookup-Kontext,
  bis eine belastbare kanonische ID vorliegt (Route-Bootstrap-Snapshot oder Profil-Read).
- Damit wird verhindert, dass ein slug frueh als "kanonisch" markiert wird und spaetere Ensures blockiert.

### B. Runtime- und Surface-Wahrheit priorisieren echte Canonical-Quellen

- Runtime-/Surface-Resolver priorisieren jetzt `profile.canonicalRestaurantId` und Route-Payload-
  `canonicalRestaurantId`/Snapshot-ID vor der lokalen `restaurantId`.
- Dadurch bleibt Header/Posts/Menu/Fokus auf derselben Restaurant-Wahrheit,
  auch wenn der Einstieg initial nur ueber slug startet.

### C. Public-Bootstrap Route-Match robust gemacht

- Das Route-Payload-Matching fuer Web-Direct-Profile ist nicht mehr nur auf strikten ID-Gleichstand reduziert,
  sondern akzeptiert auch Lookup-Matches ueber Route-Identity (`publicSlug`/`landingSlug`/`handle`).
- Nach Match wird die kanonische Restaurant-ID aus dem Payload uebernommen und als Seed-Wahrheit genutzt.

### D. Ensure-Cluster mit vorsichtiger Canonical-Hint-Logik

- Wenn `profile.canonicalRestaurantId` nur identisch zum angefragten Lookup ist,
  wird bei verfuegbarem Resolver nicht blind vertraut, sondern einmal kanonisch nachaufgeloest.
- Menu/Fokus/Posts koennen dadurch auf `/:slug/menu` nach Hard-Refresh weiter sauber auf die echte
  Restaurant-ID einschwenken.

## Ergebnis gegen die Schritt-Anforderungen

1. Slug-Aufloesung bleibt pro Einstieg zentral, ohne unnoetige Mehrfachketten bei bekannter Canonical-ID.
2. `canonicalRestaurantId` lebt als sichtbarer Public-Profile-Kontext und wird konsistent weitergereicht.
3. Header, Posts, Menu und Fokus orientieren sich an derselben kanonischen ID-Wahrheit.
4. Bei bekannter Canonical-ID werden unnoetige zweite Resolver-Laeufe reduziert (`skipProfileResolve` nur bei belastbarer Canonical-Quelle).
5. Public-Gast-Pfad bleibt read-once-orientiert, kein neuer Dauerlistener.
6. Der `/:slug/menu`-Refresh-Pfad wird gegen leeres Menu durch falsche Slug-als-Canonical-Fruehfestlegung gehaertet.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step12-public-profile-core-implementation.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Kein Root-Umbau von `/`.
- `/login` unveraendert.
- Keine Firebase-/Functions-/Rules-Aenderungen.
- Keine Playwright-/Smoke-Tests.
- `apps/menyra-social/social-app.js` unveraendert.

## Manuelle Testliste

1. Hard Reload auf `/:slug`.
2. Hard Reload auf `/:slug/posts`.
3. Hard Reload auf `/:slug/menu`.
4. Im Profil auf Menu klicken.
5. Im Profil auf Beitraege klicken.
6. Echten QR-Link oeffnen.
7. 30-60 Sekunden im Menu bleiben und Network beobachten.
8. Pruefen, dass kein Request-/Listener-Sturm wieder auftaucht.
9. Pruefen, dass Produkte im Menu nach Refresh zuverlaessig erscheinen.
10. Pruefen, dass Beitraege/Menu beim Cold Start weniger verspaetet nachziehen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
