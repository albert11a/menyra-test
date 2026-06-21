Status: CURRENT
Last updated: 2026-06-21

# Schritt 110 - Ads Array Timestamp Fix

## Ziel

Ads sollen im Restaurant-/Cafe-/Ecommerce-Editor zur Heart-Freigabe gespeichert
werden koennen, ohne dass Firestore den Schreibvorgang wegen
`serverTimestamp()` innerhalb von `items[]` ablehnt.

## Ursache

Der Ads-Pfad speichert die Ads als Array unter
`restaurants/{restaurantId}/public/ads.items`.

Firestore erlaubt `serverTimestamp()` als Transform-Wert auf Dokumentfeldern,
aber nicht innerhalb von Array-Elementen. Dadurch konnte `setDoc()` beim
Speichern einer neuen Ad abbrechen.

## Geaendert

- Ads-Item-Zeitfelder innerhalb von `items[]` werden vor dem Schreiben auf
  echte, schreibbare Werte normalisiert.
- Neue oder bearbeitete Ads erhalten fuer `createdAt`, `updatedAt` und
  `submittedAt` einen Client-Zeitstempel, wenn das Feld im Array-Item neu
  gesetzt werden muss.
- Vorhandene sichere Zeitwerte aus bestehenden Ads bleiben erhalten.
- Falls ein alter nicht schreibbarer Server-Timestamp-Sentinel in ein
  Ads-Item geraten sollte, wird er vor dem Speichern ersetzt oder entfernt.
- Der dokumentweite `updatedAt` auf `restaurants/{restaurantId}/public/ads`
  bleibt weiterhin ein Firestore-Server-Timestamp.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit der Fix im gebundelten
  Entry enthalten ist.

## Geaenderte Dateien

- `apps/menyra-social/core/menu/ads-runtime-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step110-ads-array-timestamp-fix.md`

## Bewusst Nicht Geaendert

- Keine UI-, Design-, Layout-, Text- oder UX-Aenderung.
- Keine Aenderung an Heart-Freigabelogik, Ads-Statuslogik oder Anzeige von
  approved/pending/rejected Ads.
- Keine Aenderung an Restaurant-Cards, QR, Public Menu, Warenkorb, Orders,
  Routing, Firebase Rules oder Functions.
- Keine direkte Arbeit auf `main`; der Schritt wurde auf `refactorapp`
  umgesetzt.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\menu\ads-runtime-controller.js`
- `rg -n "serverTimestamp\(|updatedAt: item\.updatedAt|submittedAt: serverTimestamp|createdAt: previous\.createdAt" apps\menyra-social\core\menu\ads-runtime-controller.js`
- `npm run build:menyra-social:bundle`

Hinweis: Der Social-Bundle-Build meldet weiterhin die bestehende Vite-Warnung
zu grossen Chunks nach Minifizierung. Das ist kein neuer Fehler dieses
Schritts.

## Manuelle Testliste

- Als Restaurant oder Cafe Profil -> Editor oeffnen und eine neue Ad mit Bild,
  Kategorie, Preisspanne und Badges speichern.
- Pruefen, dass keine Fehlermeldung zu `serverTimestamp()` innerhalb von Arrays
  erscheint.
- Pruefen, dass die gespeicherte Ad im Editor als `pending` erhalten bleibt.
- In Mnyra Heart den Tab `Ads` oeffnen und pruefen, dass die neue Ad dort zur
  Freigabe sichtbar ist.
- Eine bestehende Ad bearbeiten und erneut speichern; sie muss wieder `pending`
  sein und ohne Firestore-Fehler gespeichert werden.
- Die grossen Restaurant-/Cafe-Cards, QR, Public Menu, Warenkorb und
  Order-Flows kurz unveraendert gegenpruefen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Gegenpruefung muss manuell mit Restaurant-/Cafe- und
Heart-Zugang im Browser erfolgen.
