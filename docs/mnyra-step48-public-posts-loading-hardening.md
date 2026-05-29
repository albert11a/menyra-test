Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 48 - Public Posts Ladehaertung

## Ziel

Public Business Posts sollen im bestehenden Profil schneller und
zuverlaessiger laden, ohne die sichtbare UI zu aendern und ohne Beitraege
dauerhaft abzuschneiden.

Dieser Schritt setzt den ersten technischen Teil aus Schritt 47 um.

## Umsetzung

Der Public-Business-Posts-Loader kann jetzt zwischen zwei Ladearten
unterscheiden:

- `initialPage`: schneller erster sichtbarer Read mit Firestore-`limit`.
- Full-Read: vollstaendige Posts-Wahrheit ohne hartes Abschneiden.

Die Initial-Page wird nur fuer sichtbare Public-Posts-Starts genutzt. Sie
befuellt einen eigenen Initial-Page-Cache und nicht den Full-Cache. Dadurch
kann ein spaeterer normaler Full-Read weiterhin alle Posts laden.

Wenn bereits ein Full-Read fuer dasselbe Ziel laeuft, nutzt die Initial-Page
diesen Request mit. Parallele Initial-Page-Reads fuer dasselbe Business werden
dedupliziert.

Der bestehende sichtbare Public-Posts-Pfad nutzt jetzt fuer den ersten Read
`initialPage: true` und stoesst danach weiter den bestehenden Full-Reconcile an.
Der Open-Flow darf die Initial-Page nur fuer fruehes Anwarmen/Rendering
verwenden. Sie wird dort nicht als finale Posts-Wahrheit akzeptiert; fuer den
finalen Stand wird weiter ein normaler Full-Read verwendet.

## Warum so

Der alte sichere Zustand war vollstaendig, aber bei vielen Posts schwer, weil
der Client-Pfad direkt die komplette Collection lesen konnte.

Der neue Zustand macht den ersten sichtbaren Public-Posts-Read leichter, ohne
zur alten `FAST_LIMITS.profilePosts`-Abschneidung zurueckzugehen:

- erster sichtbarer Inhalt kann schneller kommen
- doppelte sichtbare Reads werden reduziert
- die vollstaendige Posts-Wahrheit bleibt moeglich
- vorhandene Posts werden bei Full-Read-Fehlern nicht blind geleert, solange
  ein gueltiger Cache existiert

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `tests/public-profile-runtime-controller.test.mjs`
- `docs/mnyra-step48-public-posts-loading-hardening.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route-Aenderung.
- Keine QR-Aenderung.
- Keine Cart-/Order-Aenderung.
- Keine Firebase Rules.
- Keine Cloud Functions.
- Keine Datenpfade oder Payload-Formate.
- Kein Storefront-/Renderer-Umbau.
- Kein Bundle-Build.
- Kein Dev Server.
- Kein Playwright-/Smoke-Test.

## Checks

- `node --test tests/public-profile-runtime-controller.test.mjs tests/profile-post-normalization.test.mjs`
- `git diff --check`

## Manuelle Testliste

- `/:slug` kalt oeffnen und pruefen, ob Business-Posts erscheinen.
- `/:slug` aktualisieren und pruefen, ob Posts nicht dauerhaft leer bleiben.
- `/:slug/menu` pruefen, damit Menu/QR-Pfad unveraendert ist.
- Business-Profil mit mehreren Posts pruefen: erste Posts sollen schnell
  erscheinen, danach duerfen weitere Posts nachziehen.
- Business-Profil ohne Posts pruefen: kein endloses Laden.
- QR-Link scannen: Menu muss weiter direkt offen sein.
- Cart und Order kurz gegenpruefen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Der Full-Reconcile bleibt ein kompletter Collection-Read. Das ist
bewusst so, damit keine Beitraege dauerhaft fehlen. Eine echte Pagination oder
serverseitige Public-Posts-Snapshot-Struktur waere ein separater groesserer
Vertragsschritt.
