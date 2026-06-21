Status: CURRENT
Last updated: 2026-06-21

# Schritt 111 - Heart Ads Approval Timestamp Fix

## Ziel

Mnyra Heart soll Ads akzeptieren oder ablehnen koennen, ohne dass Firestore
den Schreibvorgang wegen `serverTimestamp()` innerhalb von
`restaurants/{restaurantId}/public/ads.items` ablehnt.

## Ursache

Schritt 110 hat den Ads-Speicherpfad im Restaurant-/Cafe-/Ecommerce-Editor
korrigiert. Der Heart-Approval-Pfad hatte aber noch einen zweiten
Schreibvorgang auf dasselbe `items[]`-Array.

Beim Akzeptieren oder Ablehnen wurden `reviewedAt` und `updatedAt` direkt im
betroffenen Array-Item mit `serverTimestamp()` gesetzt. Firestore erlaubt diese
Transform-Werte nicht innerhalb von Arrays, deshalb brach `setDoc()` beim
Akzeptieren ab.

## Geaendert

- Der Heart-Approval-Schreibpfad setzt `reviewedAt` und `updatedAt` im
  betroffenen Ads-Array-Item jetzt auf einen normalen Client-Zeitwert.
- Der dokumentweite `updatedAt` auf `restaurants/{restaurantId}/public/ads`
  bleibt weiterhin ein Firestore-Server-Timestamp.
- Die Ads-Statuslogik (`pending`, `approved`, `rejected`) bleibt unveraendert.

## Geaenderte Dateien

- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step111-heart-ads-approval-timestamp-fix.md`

## Bewusst Nicht Geaendert

- Keine UI-, Design-, Layout-, Text- oder UX-Aenderung.
- Keine Aenderung am Ads-Editor-Speicherpfad aus Schritt 110.
- Keine Aenderung an Restaurant-Cards, QR, Public Menu, Warenkorb, Orders,
  Routing, Firebase Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\mnyra-heart\heart-crm-admin-write-adapter.js`
- `rg -n "reviewedAt: serverTimestamp|updatedAt: serverTimestamp\\(\\)" apps\mnyra-heart\heart-crm-admin-write-adapter.js`
- `git diff --check`
- Konfliktmarker-Suche mit `rg -n "<<<<<<<|=======|>>>>>>>"`.

## Manuelle Testliste

- Mnyra Heart -> `Ads` oeffnen und eine pending Ad akzeptieren.
- Pruefen, dass keine Firestore-Meldung zu `serverTimestamp()` innerhalb von
  Arrays erscheint.
- Restaurant-Tab oeffnen und pruefen, dass die akzeptierte Ad in der kleinen
  horizontalen Swipe-Zeile erscheint.
- Eine weitere pending Ad ablehnen und pruefen, dass der Schreibvorgang ohne
  Firestore-Fehler abgeschlossen wird.
- Pruefen, dass abgelehnte Ads nicht in der Restaurant-Swipe-Zeile erscheinen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Gegenpruefung muss manuell mit Heart- und
Restaurant-/Cafe-Zugang im Browser erfolgen.
